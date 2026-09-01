/**
 * Chamada ao modelo NVIDIA Nemotron pelo endpoint server-side `/api/nvidia-nemotron`.
 *
 * A chave da NVIDIA nunca passa pelo navegador: quem fala com a NIM API é o
 * servidor, que lê o segredo e devolve só o essencial. É preciso estar
 * autenticado — o token da sessão é anexado automaticamente.
 */

import { supabase } from "@/integrations/supabase/client";

export type MensagemNemotron = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpcoesNemotron = {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  enable_thinking?: boolean;
  reasoning_budget?: number;
};

export type RespostaNemotron = {
  conteudo: string;
  raciocinio: string | null;
  modelo: string;
  uso: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null;
  fim: string | null;
};

export async function chamarNemotron(
  messages: MensagemNemotron[],
  opcoes: OpcoesNemotron = {},
): Promise<RespostaNemotron> {
  const { data: sessao } = await supabase.auth.getSession();
  const token = sessao.session?.access_token;
  if (!token) throw new Error("É preciso estar autenticado para usar o modelo NVIDIA.");

  const r = await fetch("/api/nvidia-nemotron", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, ...opcoes }),
  });

  const dados = await r.json().catch(() => ({}));
  if (!r.ok || dados?.erro) {
    throw new Error(String(dados?.erro ?? `Falha na chamada ao modelo (${r.status}).`));
  }
  return dados as RespostaNemotron;
}
