import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Quadros e Ilustrações";
const DESC =
  "Quadros, ilustrações e obras autorais de Elifas Andreato: força narrativa e memória afetiva ligadas ao povo, à música e à cultura brasileira.";
const URL =
  "https://institutoelifasandreato.org.br/acervo/quadros-e-ilustracoes";

export const Route = createFileRoute("/acervo/quadros-e-ilustracoes")({
  head: () => ({
    meta: [
      { title: "Quadros e Ilustrações — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Quadros e Ilustrações — Acervo" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: () => (
    <PaginaArtigo
      titulo={TITULO}
      paragrafos={[
        "A coleção de quadros e ilustrações reúne desenhos, estudos visuais e obras autorais que expressam a essência do olhar de Elifas Andreato. Seu traço, ao mesmo tempo firme e afetuoso, deu rosto ao povo brasileiro: trabalhadores, músicos, atores, escritores e gente anônima das ruas ganharam, em suas mãos, dignidade e presença. Há, nessas obras, uma força narrativa singular — cada imagem conta uma história, evoca um sentimento e estabelece um diálogo direto com quem a contempla, traduzindo em linha e cor as emoções de um país.",
        "Profundamente ligada à política, à música, ao teatro, à literatura e à memória afetiva, a obra de Elifas faz da ilustração um gesto de pensamento e de tomada de posição. Em tempos de censura, suas imagens souberam dizer o que as palavras nem sempre podiam; em todos os tempos, celebraram a cultura popular e a humanidade de quem o cercava. Reunir esses quadros e ilustrações no acervo do Instituto é preservar não apenas peças de grande valor artístico, mas um modo sensível e comprometido de enxergar o Brasil.",
      ]}
    />
  ),
});
