/**
 * Catálogo de provedores e modelos disponíveis para o Anfitrião da Rede.
 *
 * Este arquivo é só dados — pode ser importado tanto pela tela `/modelos`
 * quanto pelo servidor. Nenhuma chave mora aqui.
 */

export type Provedor = "anthropic" | "openai" | "google" | "nvidia";

export type ProvedorInfo = {
  id: Provedor;
  nome: string;
  /** Nome do segredo com a chave. Só o servidor lê o valor. */
  segredo: string;
  modelos: { id: string; rotulo: string }[];
};

export const PROVEDORES: ProvedorInfo[] = [
  {
    id: "anthropic",
    nome: "Anthropic (Claude)",
    segredo: "ANTHROPIC_API_KEY",
    modelos: [
      { id: "claude-sonnet-4-5", rotulo: "Claude Sonnet 4.5 — equilíbrio" },
      { id: "claude-opus-4-1", rotulo: "Claude Opus 4.1 — mais capaz" },
      { id: "claude-haiku-4-5", rotulo: "Claude Haiku 4.5 — rápido e barato" },
      { id: "claude-sonnet-5", rotulo: "Claude Sonnet 5" },
    ],
  },
  {
    id: "openai",
    nome: "OpenAI (GPT)",
    segredo: "OPENAI_API_KEY",
    modelos: [
      { id: "gpt-4.1", rotulo: "GPT-4.1 — equilíbrio" },
      { id: "gpt-4.1-mini", rotulo: "GPT-4.1 mini — rápido e barato" },
      { id: "gpt-4o", rotulo: "GPT-4o" },
      { id: "gpt-4o-mini", rotulo: "GPT-4o mini" },
    ],
  },
  {
    id: "google",
    nome: "Google (Gemini)",
    segredo: "GOOGLE_AI_API_KEY",
    modelos: [
      { id: "gemini-2.5-flash", rotulo: "Gemini 2.5 Flash — rápido" },
      { id: "gemini-2.5-pro", rotulo: "Gemini 2.5 Pro — mais capaz" },
      { id: "gemini-2.0-flash", rotulo: "Gemini 2.0 Flash" },
    ],
  },
  {
    id: "nvidia",
    nome: "NVIDIA (NIM)",
    segredo: "NVIDIA_API_KEY",
    modelos: [
      { id: "meta/llama-3.3-70b-instruct", rotulo: "Llama 3.3 70B Instruct" },
      { id: "meta/llama-3.1-405b-instruct", rotulo: "Llama 3.1 405B Instruct" },
      { id: "qwen/qwen2.5-72b-instruct", rotulo: "Qwen 2.5 72B Instruct" },
      { id: "mistralai/mistral-large-2-instruct", rotulo: "Mistral Large 2" },
    ],
  },
];

export const PADRAO = { provedor: "anthropic" as Provedor, modelo: "claude-sonnet-5" };

export function ehProvedor(v: unknown): v is Provedor {
  return PROVEDORES.some((p) => p.id === v);
}
