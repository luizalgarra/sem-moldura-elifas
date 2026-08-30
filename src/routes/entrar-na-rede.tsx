import { createFileRoute } from "@tanstack/react-router";
import { EntrarNaRede } from "@/components/rede/EntrarNaRede";

const TITULO = "Entrar na Rede Além da Moldura — Instituto Elifas Andreato";
const DESC =
  "Duas perguntas e uma conversa curta para entrar na Rede Além da Moldura, a rede de pessoas em torno da obra de Elifas Andreato.";

export const Route = createFileRoute("/entrar-na-rede")({
  ssr: false,
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntrarNaRede,
});
