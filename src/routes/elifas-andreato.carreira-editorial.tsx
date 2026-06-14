import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Carreira Editorial";
const DESC =
  "A contribuição de Elifas Andreato para a imprensa brasileira: capas, ilustrações e projetos gráficos que transformaram ideias em imagens de força.";
const URL =
  "https://institutoelifasandreato.org.br/elifas-andreato/carreira-editorial";

export const Route = createFileRoute("/elifas-andreato/carreira-editorial")({
  head: () => ({
    meta: [
      { title: "Carreira Editorial — Elifas Andreato" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Carreira Editorial — Elifas Andreato" },
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
        "A trajetória editorial de Elifas Andreato confunde-se com a própria história da imprensa cultural brasileira. Como ilustrador e diretor de arte, colaborou com revistas, jornais e editoras [confirmar veículos e períodos], emprestando a cada página um pensamento visual rigoroso e profundamente humano. Seu trabalho ia muito além da ornamentação: cada ilustração era uma leitura crítica do texto, uma síntese capaz de revelar, em uma só imagem, a complexidade de um tema político, social ou cultural.",
        "Nesse campo, Elifas exercitou sua maior virtude: a de tradutor de ideias em imagens de grande força comunicativa. Diante da censura e das tensões de seu tempo, soube usar a linguagem gráfica como ferramenta de denúncia e de afirmação democrática, transformando capas e páginas em espaços de reflexão coletiva. Seu olhar sabia equilibrar beleza e contundência, fazendo da imagem editorial um instrumento de consciência crítica e de memória.",
        "A herança editorial de Elifas Andreato permanece como referência para ilustradores, designers e jornalistas. O Instituto preserva e estuda esse repertório como parte fundamental da história gráfica do país, reconhecendo na obra editorial do artista uma lição duradoura sobre o poder das imagens para informar, emocionar e mobilizar a sociedade.",
      ]}
    />
  ),
});
