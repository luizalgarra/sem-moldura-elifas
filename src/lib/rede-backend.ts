import { createClient } from "@supabase/supabase-js";

/**
 * Back-end da Rede Além da Moldura.
 *
 * Fica no mesmo projeto Supabase que o resto do site — nenhum endereço de banco
 * é escrito à mão aqui. Consumimos o que já existe lá: as Edge Functions
 * `rede-inscrever`, `rede-conversa` e `rede-saude`, e o schema `rede`
 * (leitura/decisão do Guardião via RLS).
 */
export const REDE_URL: string =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ??
  (typeof process !== "undefined" ? (process.env["SUPABASE_URL"] ?? "") : "");

/** Chave publicável (anon). É pública por natureza — a RLS é quem protege. */
export const REDE_CHAVE_PUBLICAVEL: string =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ??
  (typeof process !== "undefined" ? (process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "") : "");

export const redeConfigurada = REDE_URL.length > 0 && REDE_CHAVE_PUBLICAVEL.length > 0;


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
  /** A pessoa já estava na lista. Não é erro: é alguém que voltou. */
  ja_inscrito?: boolean;
};

/** As quatro respostas de "Quero um convite", enviadas no campo `perfil`. */
export const PERFIS = [
  "Visitei a exposição da CAIXA",
  "Tenho interesse ou curiosidade sobre Elifas",
  "Participo de outras atividades do Instituto",
  "Sou estudante, pesquisador ou colecionador",
] as const;

export type Perfil = (typeof PERFIS)[number];


export type RespostaConversa = {
  conversa_id: string;
  sessao: string;
  mensagem: string;
  faltam?: string[];
  completo?: boolean;
  ferramentas?: string[];
};
