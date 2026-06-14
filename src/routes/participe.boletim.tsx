import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Boletim";
const DESC =
  "Boletim do Instituto Elifas Andreato: novidades, pesquisas, exposições, bastidores do acervo, oficinas e conteúdos educativos sobre arte e memória.";
const URL = "https://institutoelifasandreato.org.br/participe/boletim";

export const Route = createFileRoute("/participe/boletim")({
  head: () => ({
    meta: [
      { title: "Boletim — Participe" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Boletim — Participe" },
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
        "O boletim do Instituto Elifas Andreato é a forma mais próxima de acompanhar, de perto, a vida do acervo e a missão de preservar a memória visual da cultura brasileira. Ao assinar, você recebe novidades, resultados de pesquisas, anúncios de exposições, bastidores do acervo, chamadas para oficinas, artigos, conteúdos educativos e relatos das ações de preservação. É um canal pensado para quem deseja ir além da visita ocasional e participar, de maneira contínua, do trabalho de salvaguarda e difusão do legado de Elifas.",
        "Mais do que uma newsletter, o boletim é um convite ao pertencimento. Nele, a obra do artista se desdobra em histórias, descobertas e reflexões sobre arte, música popular, imprensa, memória e democracia. Inscreva-se para manter viva essa conversa e ser o primeiro a saber das próximas iniciativas do Instituto. Respeitamos a sua privacidade e o uso responsável dos seus dados, em conformidade com a legislação vigente [confirmar fonte].",
      ]}
    />
  ),
});
