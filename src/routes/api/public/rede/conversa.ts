import { createFileRoute } from "@tanstack/react-router";
import { CORS, tratarConversa } from "@/lib/rede-anfitriao.server";

export const Route = createFileRoute("/api/public/rede/conversa")({
  server: {
    handlers: {
      OPTIONS: () => new Response("ok", { headers: CORS }),
      POST: ({ request }) => tratarConversa(request),
    },
  },
});
