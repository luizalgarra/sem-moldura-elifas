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
import { PADRAO, PROVEDORES, type Provedor } from "@/lib/ia-modelos";

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
