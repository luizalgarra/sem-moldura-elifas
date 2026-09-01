/**
 * Adaptador de modelos do Anfitrião.
 *
 * O formato interno das mensagens e das ferramentas continua sendo o da
 * Anthropic (`content` em blocos, `tool_use` / `tool_result`). A tradução para
 * OpenAI, Google e NVIDIA acontece só na borda de cada provedor — assim o
 * prompt e a lógica das fichas não mudam uma vírgula.
 */

import { createClient } from "@supabase/supabase-js";
import { PADRAO, PROVEDORES, ehProvedor, type Provedor } from "./ia-modelos";

const dorme = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Escolha = { provedor: Provedor; modelo: string };

/** Bloco no formato interno (Anthropic). */
type Bloco =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: any }
  | { type: "tool_result"; tool_use_id: string; content: string };

export type RespostaModelo = { content: Bloco[]; stop_reason: string };

export function chaveDe(provedor: Provedor): string | undefined {
  const p = PROVEDORES.find((x) => x.id === provedor);
  if (!p) return undefined;
  const v = process.env[p.segredo];
  return v && v.length > 0 ? v : undefined;
}

/** Lê a escolha guardada em `public.ia_config`. Cai no padrão se algo faltar. */
export async function modeloAtivo(): Promise<Escolha> {
  try {
    const sb = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
      { auth: { persistSession: false } },
    );
    const { data } = await sb.from("ia_config").select("provedor,modelo").eq("id", 1).maybeSingle();
    const provedor = (data as any)?.provedor;
    const modelo = (data as any)?.modelo;
    if (ehProvedor(provedor) && typeof modelo === "string" && modelo) {
      // Sem chave configurada, não adianta tentar: volta para o padrão.
      if (chaveDe(provedor)) return { provedor, modelo };
      console.error(`modelo escolhido (${provedor}) sem chave; usando o padrao`);
    }
  } catch (e: any) {
    console.error("ia_config indisponivel:", e?.message ?? e);
  }
  return { ...PADRAO, modelo: process.env["MODELO"] ?? PADRAO.modelo };
}

/* ------------------------- tradutores por provedor ------------------------- */

const textoDos = (blocos: Bloco[]) =>
  blocos.filter((b) => b.type === "text").map((b: any) => b.text).join("\n");

function paraOpenAI(sys: string, historico: any[], tools: any[]) {
  const messages: any[] = [{ role: "system", content: sys }];
  for (const m of historico) {
    if (typeof m.content === "string") {
      messages.push({ role: m.role, content: m.content });
      continue;
    }
    const blocos: Bloco[] = m.content ?? [];
    if (m.role === "assistant") {
      const chamadas = blocos.filter((b) => b.type === "tool_use") as any[];
      messages.push({
        role: "assistant",
        content: textoDos(blocos) || null,
        ...(chamadas.length
          ? {
              tool_calls: chamadas.map((b) => ({
                id: b.id,
                type: "function",
                function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) },
              })),
            }
          : {}),
      });
    } else {
      for (const b of blocos as any[]) {
        if (b.type === "tool_result") {
          messages.push({ role: "tool", tool_call_id: b.tool_use_id, content: String(b.content ?? "") });
        } else if (b.type === "text") {
          messages.push({ role: "user", content: b.text });
        }
      }
    }
  }
  return {
    messages,
    tools: tools.map((t) => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.input_schema },
    })),
  };
}

function deOpenAI(dados: any): RespostaModelo {
  const msg = dados?.choices?.[0]?.message ?? {};
  const content: Bloco[] = [];
  if (msg.content) content.push({ type: "text", text: String(msg.content) });
  for (const c of msg.tool_calls ?? []) {
    let input: any = {};
    try { input = JSON.parse(c.function?.arguments || "{}"); } catch { input = {}; }
    content.push({ type: "tool_use", id: c.id, name: c.function?.name, input });
  }
  return { content, stop_reason: (msg.tool_calls ?? []).length ? "tool_use" : "end_turn" };
}

/** Gemini recusa objeto de parâmetros sem propriedades. */
function esquemaGoogle(schema: any) {
  if (!schema || !schema.properties || Object.keys(schema.properties).length === 0) return undefined;
  return schema;
}

function paraGoogle(sys: string, historico: any[], tools: any[]) {
  const nomePorId = new Map<string, string>();
  const contents: any[] = [];
  for (const m of historico) {
    if (typeof m.content === "string") {
      contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] });
      continue;
    }
    const blocos: Bloco[] = m.content ?? [];
    if (m.role === "assistant") {
      const parts: any[] = [];
      for (const b of blocos as any[]) {
        if (b.type === "text" && b.text) parts.push({ text: b.text });
        if (b.type === "tool_use") { nomePorId.set(b.id, b.name); parts.push({ functionCall: { name: b.name, args: b.input ?? {} } }); }
      }
      if (parts.length) contents.push({ role: "model", parts });
    } else {
      const parts: any[] = [];
      for (const b of blocos as any[]) {
        if (b.type === "tool_result") {
          parts.push({
            functionResponse: {
              name: nomePorId.get(b.tool_use_id) ?? "ferramenta",
              response: { resultado: String(b.content ?? "") },
            },
          });
        } else if (b.type === "text") {
          parts.push({ text: b.text });
        }
      }
      if (parts.length) contents.push({ role: "user", parts });
    }
  }
  const declaracoes = tools.map((t) => {
    const p = esquemaGoogle(t.input_schema);
    return { name: t.name, description: t.description, ...(p ? { parameters: p } : {}) };
  });
  return {
    contents,
    systemInstruction: { parts: [{ text: sys }] },
    ...(declaracoes.length ? { tools: [{ functionDeclarations: declaracoes }] } : {}),
    generationConfig: { maxOutputTokens: 1024 },
  };
}

function deGoogle(dados: any): RespostaModelo {
  const parts = dados?.candidates?.[0]?.content?.parts ?? [];
  const content: Bloco[] = [];
  let n = 0;
  for (const p of parts) {
    if (p.text) content.push({ type: "text", text: String(p.text) });
    if (p.functionCall) {
      content.push({ type: "tool_use", id: `g${Date.now()}_${n++}`, name: p.functionCall.name, input: p.functionCall.args ?? {} });
    }
  }
  return { content, stop_reason: content.some((b) => b.type === "tool_use") ? "tool_use" : "end_turn" };
}

/* ----------------------------- chamada única ------------------------------ */

async function umaChamada(
  escolha: Escolha,
  chave: string,
  sys: string,
  historico: any[],
  tools: any[],
): Promise<Response> {
  if (escolha.provedor === "anthropic") {
    return fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": chave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: escolha.modelo, max_tokens: 1024, system: sys, tools, messages: historico }),
    });
  }

  if (escolha.provedor === "google") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(escolha.modelo)}:generateContent`;
    return fetch(url, {
      method: "POST",
      headers: { "x-goog-api-key": chave, "content-type": "application/json" },
      body: JSON.stringify(paraGoogle(sys, historico, tools)),
    });
  }

  // OpenAI e NVIDIA falam o mesmo dialeto.
  const base = escolha.provedor === "openai"
    ? "https://api.openai.com/v1/chat/completions"
    : "https://integrate.api.nvidia.com/v1/chat/completions";
  const { messages, tools: ferr } = paraOpenAI(sys, historico, tools);
  return fetch(base, {
    method: "POST",
    headers: { authorization: `Bearer ${chave}`, "content-type": "application/json" },
    body: JSON.stringify({ model: escolha.modelo, max_tokens: 1024, messages, tools: ferr }),
  });
}

/**
 * Fala com o modelo escolhido e devolve sempre no formato interno.
 * Um 5xx passageiro do modelo nao pode custar a conversa de uma pessoa.
 */
export async function conversarCom(
  escolha: Escolha,
  sys: string,
  historico: any[],
  tools: any[],
): Promise<RespostaModelo> {
  const chave = chaveDe(escolha.provedor);
  if (!chave) throw new Error(`modelo sem chave: falta o segredo do provedor ${escolha.provedor}`);

  let ultimo = "modelo: sem resposta";
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    let r: Response;
    try {
      r = await umaChamada(escolha, chave, sys, historico, tools);
    } catch (e: any) {
      ultimo = `modelo indisponivel: ${e?.message ?? e}`;
      await dorme(700 * (tentativa + 1));
      continue;
    }
    if (r.ok) {
      const dados = await r.json();
      if (escolha.provedor === "anthropic") {
        return { content: dados.content ?? [], stop_reason: dados.stop_reason ?? "end_turn" };
      }
      return escolha.provedor === "google" ? deGoogle(dados) : deOpenAI(dados);
    }
    ultimo = `modelo ${r.status}: ${(await r.text()).slice(0, 300)}`;
    // 4xx que nao seja excesso de chamadas e erro nosso: repetir nao resolve.
    if (r.status < 500 && r.status !== 429) break;
    console.error("modelo instavel, tentando de novo:", ultimo);
    await dorme(700 * (tentativa + 1));
  }
  throw new Error(ultimo);
}
