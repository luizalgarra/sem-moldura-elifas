import { createFileRoute } from "@tanstack/react-router";
import { EntrarNaRede } from "@/components/rede/EntrarNaRede";

const TITULO = "Continuar a conversa — Rede Além da Moldura";
const DESC =
  "Retome de onde parou a conversa de entrada na Rede Além da Moldura, do Instituto Elifas Andreato.";

export const Route = createFileRoute("/continuar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EntrarNaRede,
});
