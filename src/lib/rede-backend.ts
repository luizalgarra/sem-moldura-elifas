import { createClient } from "@supabase/supabase-js";

/**
 * Back-end da Rede Além da Moldura.
 *
 * A conversa do Anfitrião roda no servidor do próprio site, em
 * `/api/public/rede/{inscrever,conversa,saude}`. O schema `rede` do banco é
 * lido direto aqui só no painel do Guardião (leitura/decisão via RLS).
 */
export const REDE_URL: string =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ??
  (typeof process !== "undefined" ? (process.env["SUPABASE_URL"] ?? "") : "");

/** Chave publicável (anon). É pública por natureza — a RLS é quem protege. */
export const REDE_CHAVE_PUBLICAVEL: string =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ??
  (typeof process !== "undefined" ? (process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "") : "");

export const redeConfigurada = REDE_URL.length > 0 && REDE_CHAVE_PUBLICAVEL.length > 0;


/** Chama um endpoint da Rede no próprio site e devolve o JSON já convertido. */
export async function chamarRede<T>(funcao: string, corpo: unknown): Promise<T> {
  const caminho = funcao.replace(/^rede-/, "");
  const resposta = await fetch(`/api/public/rede/${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  /** Histórico completo quando alguém já cadastrado reabre a conversa. */
  turnos?: { de: "pessoa" | "anfitriao"; texto: string }[];
  faltam?: string[];
  completo?: boolean;
  ferramentas?: string[];
};

