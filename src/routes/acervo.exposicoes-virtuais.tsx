import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Exposições Virtuais";
const DESC =
  "Exposições virtuais do Instituto Elifas Andreato: percursos curatoriais digitais que democratizam o acesso à obra do artista e à memória da cultura brasileira.";
const URL =
  "https://institutoelifasandreato.org.br/acervo/exposicoes-virtuais";

export const Route = createFileRoute("/acervo/exposicoes-virtuais")({
  head: () => ({
    meta: [
      { title: "Exposições Virtuais — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Exposições Virtuais — Acervo" },
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
        "As exposições virtuais do Instituto Elifas Andreato nascem de uma convicção simples e profunda: a arte deve circular. Levar a obra de Elifas para o ambiente digital é uma forma de derrubar barreiras geográficas, econômicas e físicas, permitindo que estudantes de uma escola pública do interior, pesquisadores em outro continente, admiradores da Música Popular Brasileira e novas gerações de artistas tenham acesso, de qualquer lugar, ao universo visual que o artista construiu ao longo de décadas. Cada mostra digital é pensada como um percurso curatorial — não um simples depósito de imagens, mas um caminho de leitura que contextualiza, relaciona e dá sentido às obras.",
        "Por meio desses percursos, capas de discos, ilustrações, cromos e estudos ganham narrativa: é possível acompanhar como Elifas traduziu em imagem as vozes da MPB, como sua arte dialogou com a imprensa e com os tempos de censura, e como o desenho se tornou instrumento de memória política e resistência democrática. As exposições virtuais também ampliam o trabalho educativo do Instituto, oferecendo materiais de apoio a professores e mediadores e convidando o público a uma fruição atenta e crítica. Mais do que mostrar, queremos aproximar — fazer com que cada visitante reconheça, na obra de Elifas, um pedaço da história afetiva e cultural do Brasil.",
      ]}
    />
  ),
});
