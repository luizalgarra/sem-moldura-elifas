// Checagem de saude da Rede. Nunca devolve valor de segredo, so presenca e status.
import { createFileRoute } from "@tanstack/react-router";

async function saude(): Promise<Response> {
  const k = process.env["ANTHROPIC_API_KEY"];
  const out: any = {
    chave_presente: !!k,
    chave_tamanho: k ? k.length : 0,
    chave_prefixo: k ? k.slice(0, 7) : null,
    modelo: process.env["MODELO"] ?? "claude-sonnet-5 (padrao)",
  };
  if (k) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": k, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: process.env["MODELO"] ?? "claude-sonnet-5", max_tokens: 16, messages: [{ role: "user", content: "oi" }] }),
      });
      out.modelo_status = r.status;
      out.modelo_resposta = (await r.text()).slice(0, 400);
    } catch (e: any) {
      out.modelo_erro = String(e?.message ?? e).slice(0, 400);
    }
  }
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
}

export const Route = createFileRoute("/api/public/rede/saude")({
  server: { handlers: { GET: () => saude() } },
});
