/**
 * Escolha do modelo de IA do Anfitrião (tela `/modelos`).
 *
 * Tudo aqui é só para administradores: `requireSupabaseAuth` prova quem é, e a
 * RPC `is_admin` prova o papel. As chaves são lidas apenas dentro dos handlers
 * e nunca voltam para a tela — só "presente" ou "ausente".
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PADRAO, PROVEDORES, ehProvedor, type Provedor } from "@/lib/ia-modelos";

const ERRO_NAO_AUTORIZADO = "Não autorizado.";

async function ehAdmin(context: { supabase: unknown }): Promise<boolean> {
  const cliente = context.supabase as {
    rpc: (fn: "is_admin") => Promise<{ data: boolean | null; error: unknown }>;
  };
  const { data, error } = await cliente.rpc("is_admin");
  if (error) {
    console.error("ia-config is_admin:", JSON.stringify(error));
    return false;
  }
  return data === true;
}

const provedores = PROVEDORES.map((p) => p.id) as [Provedor, ...Provedor[]];

const Escolha = z.object({
  provedor: z.enum(provedores),
  modelo: z.string().trim().min(1).max(120),
});

export type EstadoIA = {
  provedor: Provedor;
  modelo: string;
  atualizado_em: string | null;
  chaves: Record<string, boolean>;
};

/** Lê a escolha atual e quais provedores têm chave configurada. */
export const lerConfigIA = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EstadoIA> => {
    if (!(await ehAdmin(context))) throw new Error(ERRO_NAO_AUTORIZADO);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("ia_config")
      .select("provedor,modelo,atualizado_em")
      .eq("id", 1)
      .maybeSingle();

    const chaves: Record<string, boolean> = {};
    for (const p of PROVEDORES) {
      chaves[p.id] = Boolean(process.env[p.segredo]);
    }

    return {
      provedor: ((data as any)?.provedor ?? PADRAO.provedor) as Provedor,
      modelo: (data as any)?.modelo ?? PADRAO.modelo,
      atualizado_em: (data as any)?.atualizado_em ?? null,
      chaves,
    };
  });

/** Salva o modelo que passa a responder em todas as conversas. */
export const salvarConfigIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Escolha.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: boolean; erro?: string }> => {
    if (!(await ehAdmin(context))) return { ok: false, erro: ERRO_NAO_AUTORIZADO };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("ia_config").upsert(
      {
        id: 1,
        provedor: data.provedor,
        modelo: data.modelo,
        atualizado_em: new Date().toISOString(),
        atualizado_por: context.userId,
      },
      { onConflict: "id" },
    );
    if (error) return { ok: false, erro: error.message };
    return { ok: true };
  });

export type Teste = { ok: boolean; ms: number; resposta?: string; erro?: string };

/** Manda um "oi" ao modelo e conta o que aconteceu. Nunca mostra a chave. */
export const testarModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Escolha.parse(input))
  .handler(async ({ data, context }): Promise<Teste> => {
    if (!(await ehAdmin(context))) return { ok: false, ms: 0, erro: ERRO_NAO_AUTORIZADO };

    const { conversarCom } = await import("@/lib/ia-provedores.server");
    const inicio = Date.now();
    try {
      const r = await conversarCom(
        { provedor: data.provedor, modelo: data.modelo },
        "Responda em português, em uma frase curta.",
        [{ role: "user", content: "oi, tudo bem?" }],
        [],
        "teste",
      );
      const texto = r.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join(" ")
        .trim();
      return { ok: true, ms: Date.now() - inicio, resposta: texto.slice(0, 300) };
    } catch (e: any) {
      return { ok: false, ms: Date.now() - inicio, erro: String(e?.message ?? e).slice(0, 400) };
    }
  });

/* ------------------------------ chaves ------------------------------ */

export type ChaveStatus = { ok: boolean; status?: number; erro?: string };

/** Confere se a chave do provedor ainda é aceita. Nunca expõe o valor. */
export const verificarChave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ provedor: z.enum(provedores) }).parse(input))
  .handler(async ({ data, context }): Promise<ChaveStatus> => {
    if (!(await ehAdmin(context))) return { ok: false, erro: ERRO_NAO_AUTORIZADO };
    const { verificarChaveProvedor } = await import("@/lib/ia-provedores.server");
    return verificarChaveProvedor(data.provedor);
  });

/* ------------------------------ consumo ------------------------------ */

export type LinhaUso = {
  provedor: string;
  modelo: string;
  chamadas: number;
  erros: number;
  tokens_entrada: number;
  tokens_saida: number;
};

export type DiaUso = { dia: string; tokens: number; chamadas: number };

export type ResumoUso = {
  periodo: string;
  linhas: LinhaUso[];
  dias: DiaUso[];
};

const PERIODOS = ["hoje", "7d", "30d", "tudo"] as const;
export type Periodo = (typeof PERIODOS)[number];

function desdeQuando(periodo: Periodo): string | null {
  const agora = new Date();
  if (periodo === "hoje") {
    const d = new Date(agora);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (periodo === "7d") return new Date(agora.getTime() - 7 * 864e5).toISOString();
  if (periodo === "30d") return new Date(agora.getTime() - 30 * 864e5).toISOString();
  return null;
}

/** Consumo agregado por modelo e por dia. */
export const resumoUsoIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ periodo: z.enum(PERIODOS) }).parse(input))
  .handler(async ({ data, context }): Promise<ResumoUso> => {
    if (!(await ehAdmin(context))) throw new Error(ERRO_NAO_AUTORIZADO);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let consulta = supabaseAdmin
      .from("ia_uso")
      .select("provedor,modelo,tokens_entrada,tokens_saida,ok,created_at")
      .order("created_at", { ascending: false })
      .limit(20000);

    const desde = desdeQuando(data.periodo);
    if (desde) consulta = consulta.gte("created_at", desde);

    const { data: linhas, error } = await consulta;
    if (error) throw new Error(error.message);

    const porModelo = new Map<string, LinhaUso>();
    const porDia = new Map<string, DiaUso>();

    for (const r of (linhas ?? []) as any[]) {
      const chave = `${r.provedor}:${r.modelo}`;
      const atual =
        porModelo.get(chave) ??
        {
          provedor: r.provedor,
          modelo: r.modelo,
          chamadas: 0,
          erros: 0,
          tokens_entrada: 0,
          tokens_saida: 0,
        };
      atual.chamadas += 1;
      if (!r.ok) atual.erros += 1;
      atual.tokens_entrada += Number(r.tokens_entrada ?? 0);
      atual.tokens_saida += Number(r.tokens_saida ?? 0);
      porModelo.set(chave, atual);

      const dia = String(r.created_at).slice(0, 10);
      const d = porDia.get(dia) ?? { dia, tokens: 0, chamadas: 0 };
      d.tokens += Number(r.tokens_entrada ?? 0) + Number(r.tokens_saida ?? 0);
      d.chamadas += 1;
      porDia.set(dia, d);
    }

    return {
      periodo: data.periodo,
      linhas: [...porModelo.values()].sort(
        (a, b) => b.tokens_entrada + b.tokens_saida - (a.tokens_entrada + a.tokens_saida),
      ),
      dias: [...porDia.values()].sort((a, b) => a.dia.localeCompare(b.dia)),
    };
  });

/* ------------------------------ agente ------------------------------ */

export type AgenteConfig = {
  instrucoes: string;
  regras_extras: string;
  temperatura: number;
  max_tokens: number;
  modelo_etapa_a: string;
  modelo_etapa_b: string;
  modelo_fallback: string;
  atualizado_em: string | null;
};

const AGENTE_VAZIO: AgenteConfig = {
  instrucoes: "",
  regras_extras: "",
  temperatura: 0.7,
  max_tokens: 1024,
  modelo_etapa_a: "",
  modelo_etapa_b: "",
  modelo_fallback: "",
  atualizado_em: null,
};

/** Valor "provedor:modelo" ou vazio (= modelo global da tela /modelos). */
const modeloOuVazio = z
  .string()
  .trim()
  .max(160)
  .refine((v) => v === "" || (/^[^:]+:.+/.test(v) && ehProvedor(v.split(":")[0])), {
    message: "modelo inválido",
  });

const AgenteEntrada = z.object({
  instrucoes: z.string().max(4000),
  regras_extras: z.string().max(4000),
  temperatura: z.number().min(0).max(1),
  max_tokens: z.number().int().min(64).max(8192),
  modelo_etapa_a: modeloOuVazio,
  modelo_etapa_b: modeloOuVazio,
  modelo_fallback: modeloOuVazio,
});

/** Lê a configuração do Anfitrião (tela `/agente`). */
export const lerAgenteConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AgenteConfig> => {
    if (!(await ehAdmin(context))) throw new Error(ERRO_NAO_AUTORIZADO);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("agente_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (!data) return AGENTE_VAZIO;
    const d = data as any;
    return {
      instrucoes: d.instrucoes ?? "",
      regras_extras: d.regras_extras ?? "",
      temperatura: d.temperatura != null ? Number(d.temperatura) : 0.7,
      max_tokens: d.max_tokens ?? 1024,
      modelo_etapa_a: d.modelo_etapa_a ?? "",
      modelo_etapa_b: d.modelo_etapa_b ?? "",
      modelo_fallback: d.modelo_fallback ?? "",
      atualizado_em: d.atualizado_em ?? null,
    };
  });

/** Salva a configuração do Anfitrião. Vale para a próxima mensagem já. */
export const salvarAgenteConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AgenteEntrada.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: boolean; erro?: string }> => {
    if (!(await ehAdmin(context))) return { ok: false, erro: ERRO_NAO_AUTORIZADO };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("agente_config").upsert(
      {
        id: 1,
        instrucoes: data.instrucoes || null,
        regras_extras: data.regras_extras || null,
        temperatura: data.temperatura,
        max_tokens: data.max_tokens,
        modelo_etapa_a: data.modelo_etapa_a || null,
        modelo_etapa_b: data.modelo_etapa_b || null,
        modelo_fallback: data.modelo_fallback || null,
        atualizado_em: new Date().toISOString(),
        atualizado_por: context.userId,
      },
      { onConflict: "id" },
    );
    if (error) return { ok: false, erro: error.message };
    return { ok: true };
  });

/**
 * Manda uma mensagem de teste ao Anfitrião com a configuração salva,
 * sem ferramentas e sem gravar nada. Serve para sentir o tom.
 */
export const testarAgente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ mensagem: z.string().trim().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }): Promise<Teste> => {
    if (!(await ehAdmin(context))) return { ok: false, ms: 0, erro: ERRO_NAO_AUTORIZADO };

    const { conversarCom, modeloAtivo } = await import("@/lib/ia-provedores.server");
    const { configAgente } = await import("@/lib/rede-anfitriao.server");
    const cfg = await configAgente();

    const sys = [
      "Você é o Anfitrião da Rede Além da Moldura — a rede de pessoas em torno da obra de Elifas Andreato. Responda em pt-BR, com acolhimento, duas a quatro frases, sem emoji.",
      cfg.instrucoes ? `\nPERSONALIDADE E TOM (definido pela curadoria)\n${cfg.instrucoes}` : "",
      cfg.regras_extras ? `\nREGRAS EXTRAS (definidas pela curadoria)\n${cfg.regras_extras}` : "",
    ].join("");

    const escolha = (await modeloAtivo());
    const inicio = Date.now();
    try {
      const r = await conversarCom(
        escolha,
        sys,
        [{ role: "user", content: data.mensagem }],
        [],
        "teste_agente",
        { temperatura: cfg.temperatura, maxTokens: cfg.max_tokens },
      );
      const texto = r.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join(" ")
        .trim();
      return { ok: true, ms: Date.now() - inicio, resposta: texto.slice(0, 600) };
    } catch (e: any) {
      return { ok: false, ms: Date.now() - inicio, erro: String(e?.message ?? e).slice(0, 400) };
    }
  });
