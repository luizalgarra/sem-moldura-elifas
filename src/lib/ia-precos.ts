/**
 * Preços de referência por modelo, em dólares por milhão de tokens.
 *
 * É uma estimativa para a tela de consumo: o valor oficial é sempre o do
 * painel de cobrança de cada provedor. Modelo sem preço aqui aparece com "—".
 */

export type Preco = { entrada: number; saida: number };

export const PRECOS: Record<string, Preco> = {
  // Anthropic
  "claude-sonnet-4-5": { entrada: 3, saida: 15 },
  "claude-sonnet-5": { entrada: 3, saida: 15 },
  "claude-opus-4-1": { entrada: 15, saida: 75 },
  "claude-haiku-4-5": { entrada: 1, saida: 5 },
  // OpenAI
  "gpt-4.1": { entrada: 2, saida: 8 },
  "gpt-4.1-mini": { entrada: 0.4, saida: 1.6 },
  "gpt-5.1": { entrada: 1.25, saida: 10 },
  "gpt-4o": { entrada: 2.5, saida: 10 },
  "gpt-4o-mini": { entrada: 0.15, saida: 0.6 },
  // Google
  "gemini-3.6-flash": { entrada: 0.3, saida: 2.5 },
  "gemini-3.5-flash": { entrada: 0.3, saida: 2.5 },
  "gemini-3.1-pro-preview": { entrada: 1.25, saida: 10 },
  // NVIDIA (NIM)
  "meta/llama-3.3-70b-instruct": { entrada: 0.2, saida: 0.2 },
  "meta/llama-3.1-405b-instruct": { entrada: 0.9, saida: 0.9 },
  "qwen/qwen2.5-72b-instruct": { entrada: 0.2, saida: 0.2 },
  "mistralai/mistral-large-2-instruct": { entrada: 0.6, saida: 0.6 },
  "nvidia/nemotron-3.5-lightning-30b-a3b": { entrada: 0.1, saida: 0.4 },
};

/** Custo estimado em US$ de uma quantidade de tokens. `null` quando não há preço. */
export function custoEstimado(
  modelo: string,
  tokensEntrada: number,
  tokensSaida: number,
): number | null {
  const p = PRECOS[modelo];
  if (!p) return null;
  return (tokensEntrada / 1_000_000) * p.entrada + (tokensSaida / 1_000_000) * p.saida;
}

export function formatarUSD(v: number): string {
  if (v > 0 && v < 0.01) return "< US$ 0,01";
  return `US$ ${v.toFixed(2).replace(".", ",")}`;
}
