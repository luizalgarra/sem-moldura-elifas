/**
 * POST /api/nvidia-nemotron — ponte segura com a NVIDIA NIM API.
 *
 * Equivalente server-side da função "nvidia-nemotron": a chave NVIDIA_API_KEY
 * vive apenas nos segredos do servidor (process.env, lido dentro do handler),
 * nunca vai ao navegador e nunca aparece em log.
 *
 * Acesso restrito: exige um usuário autenticado (Bearer token da sessão),
 * para que o endpoint não vire um proxy aberto de IA.
 */

import { createFileRoute } from "@tanstack/react-router";

const MODELO = "nvidia/nemotron-3.5-lightning-30b-a3b";
const URL_NIM = "https://integrate.api.nvidia.com/v1/chat/completions";

const MENSAGENS_ERRO: Record<number, string> = {
  400: "Pedido inválido para o modelo.",
  401: "Chave da NVIDIA ausente, inválida ou expirada.",
  403: "Acesso negado pelo provedor NVIDIA.",
  429: "Limite de chamadas atingido; tente de novo em instantes.",
  500: "Erro interno no provedor NVIDIA.",
};

type Mensagem = { role: "system" | "user" | "assistant"; content: string };

async function autenticado(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  try {
    const r = await fetch(`${process.env["SUPABASE_URL"]}/auth/v1/user`, {
      headers: {
        authorization: `Bearer ${token}`,
        apikey: process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      },
    });
    return r.ok;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/nvidia-nemotron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await autenticado(request))) {
          return Response.json({ erro: "Não autorizado." }, { status: 401 });
        }

        const chave = process.env["NVIDIA_API_KEY"];
        if (!chave) {
          return Response.json(
            { erro: "NVIDIA_API_KEY não configurada nos segredos do servidor." },
            { status: 500 },
          );
        }

        let corpo: any;
        try {
          corpo = await request.json();
        } catch {
          return Response.json({ erro: "Corpo JSON inválido." }, { status: 400 });
        }

        const mensagens: Mensagem[] | null = Array.isArray(corpo?.messages) ? corpo.messages : null;
        if (!mensagens || mensagens.length === 0) {
          return Response.json(
            { erro: "Envie { messages: [{ role, content }] }." },
            { status: 400 },
          );
        }

        const payload = {
          model: MODELO,
          messages: mensagens,
          temperature: corpo?.temperature ?? 1,
          top_p: corpo?.top_p ?? 0.95,
          max_tokens: corpo?.max_tokens ?? 16384,
          chat_template_kwargs: {
            enable_thinking: corpo?.enable_thinking ?? true,
          },
          reasoning_budget: corpo?.reasoning_budget ?? 16384,
          stream: false,
        };

        try {
          const r = await fetch(URL_NIM, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${chave}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!r.ok) {
            const detalhe = (await r.text()).slice(0, 300);
            console.error(`[nvidia-nemotron] NIM ${r.status}:`, detalhe);
            const mensagem = MENSAGENS_ERRO[r.status] ?? `Erro ${r.status} no provedor NVIDIA.`;
            return Response.json({ erro: mensagem, status: r.status }, { status: r.status });
          }

          const dados = await r.json();
          const escolha = dados?.choices?.[0] ?? {};

          // Devolve ao frontend só o necessário — nada de chaves ou metadados internos.
          return Response.json({
            conteudo: escolha?.message?.content ?? "",
            raciocinio: escolha?.message?.reasoning_content ?? null,
            modelo: dados?.model ?? MODELO,
            uso: dados?.usage ?? null,
            fim: escolha?.finish_reason ?? null,
          });
        } catch (e) {
          console.error(
            "[nvidia-nemotron] falhou:",
            e instanceof Error ? e.message : String(e),
          );
          return Response.json({ erro: "Falha ao falar com o modelo NVIDIA." }, { status: 500 });
        }
      },
    },
  },
});
