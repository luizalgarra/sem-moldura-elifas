import { createClient } from "@supabase/supabase-js";

/**
 * Back-end da Rede Além da Moldura.
 *
 * É um projeto Supabase próprio, separado do backend do catálogo. Aqui só
 * consumimos o que já existe lá: as Edge Functions `rede-inscrever` e
 * `rede-conversa`, e o schema `rede` (leitura/decisão do Guardião via RLS).
 */
export const REDE_URL = "https://ghtqfxjpgnjbdfjxfjhq.supabase.co";

/**
 * Chave publicável (anon) do projeto da Rede. É pública por natureza — a RLS
 * é quem protege os dados. Preencha com a chave anon do projeto acima.
 */
export const REDE_CHAVE_PUBLICAVEL =
  (import.meta.env["VITE_REDE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ?? "";

export const redeConfigurada = REDE_CHAVE_PUBLICAVEL.length > 0;

/** Chama uma Edge Function da Rede e devolve o JSON já convertido. */
export async function chamarRede<T>(funcao: string, corpo: unknown): Promise<T> {
  const resposta = await fetch(`${REDE_URL}/functions/v1/${funcao}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDE_CHAVE_PUBLICAVEL}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(corpo),
  });

  let dados: unknown = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  const erro = (dados as { erro?: string; message?: string } | null)?.erro;
  if (!resposta.ok || erro) {
    // A mensagem que aparece na tela é a que o servidor mandou — nada inventado aqui.
    throw new Error(
      erro ??
        (dados as { message?: string } | null)?.message ??
        "Não foi possível falar com a Rede agora.",
    );
  }

  return dados as T;
}

function criarClienteRede() {
  return createClient(REDE_URL, REDE_CHAVE_PUBLICAVEL, {
    db: { schema: "rede" },
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "rede-auth" },
  });
}

let _cliente: ReturnType<typeof criarClienteRede> | undefined;

/** Cliente Supabase da Rede, apontando para o schema `rede`. */
export function clienteRede() {
  if (!_cliente) _cliente = criarClienteRede();
  return _cliente;
}

/* ---------- formatos de resposta das Edge Functions ---------- */

export type RespostaInscrever = {
  lista_espera_id: string;
  email: string;
};

export type RespostaConversa = {
  conversa_id: string;
  sessao: string;
  mensagem: string;
  faltam?: string[];
  completo?: boolean;
  ferramentas?: string[];
};
