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
