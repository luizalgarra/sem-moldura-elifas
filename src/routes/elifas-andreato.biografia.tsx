import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Biografia";
const DESC =
  "Biografia de Elifas Andreato: artista visual, ilustrador, designer gráfico e diretor de arte que traduziu a cultura brasileira em imagens.";
const URL = "https://institutoelifasandreato.org.br/elifas-andreato/biografia";

export const Route = createFileRoute("/elifas-andreato/biografia")({
  head: () => ({
    meta: [
      { title: "Biografia — Elifas Andreato" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Biografia — Elifas Andreato" },
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
        "Elifas Andreato é uma das figuras centrais da cultura visual brasileira: artista plástico, ilustrador, designer gráfico, capista e diretor de arte cuja obra atravessou décadas de história do país. De origem simples e formação profundamente ligada à observação do mundo popular [verificar data e local de nascimento], desenvolveu desde cedo uma sensibilidade rara para transformar gente, música e política em imagem. Seu traço — ao mesmo tempo realista e poético — soube dar rosto às vozes do Brasil, conferindo dignidade visual a artistas, trabalhadores e personagens muitas vezes invisibilizados pela história oficial.",
        "Ao longo de sua trajetória, atuou em frentes diversas e complementares: ilustrou e dirigiu a arte de publicações marcantes da imprensa nacional, criou centenas de capas de discos que definiram a identidade visual da Música Popular Brasileira e colaborou com o teatro, a literatura e o jornalismo cultural [confirmar fonte]. Em todos esses campos, manteve um compromisso constante com a memória nacional e com a defesa da democracia, fazendo de cada imagem um gesto de afeto e de resistência.",
        "Mais do que um currículo de realizações, a biografia de Elifas Andreato é a história de um Brasil que se reconhece em suas próprias imagens. Sua obra dialoga com a música popular, com a luta por direitos, com a educação pela arte e com a preservação da memória cultural — territórios que o Instituto Elifas Andreato hoje cuida e mantém vivos. Conhecer sua trajetória é também percorrer caminhos da sensibilidade, da coragem e da generosidade que marcaram a cultura brasileira contemporânea.",
      ]}
    />
  ),
});
