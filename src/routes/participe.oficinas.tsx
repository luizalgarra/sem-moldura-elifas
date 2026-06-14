import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Oficinas";
const DESC =
  "Oficinas educativas do Instituto Elifas Andreato: arte gráfica, ilustração, memória, música popular, leitura de imagens e produção cultural.";
const URL = "https://institutoelifasandreato.org.br/participe/oficinas";

export const Route = createFileRoute("/participe/oficinas")({
  head: () => ({
    meta: [
      { title: "Oficinas — Participe" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Oficinas — Participe" },
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
        "As oficinas do Instituto Elifas Andreato nascem da própria obra do artista e a transformam em experiência criativa. Inspiradas em sua trajetória de capista, ilustrador e designer, elas exploram a arte gráfica, a ilustração, a leitura de imagens, a memória, a música popular, a imprensa, a democracia e a produção cultural. Voltadas a públicos diversos — estudantes, educadores, artistas iniciantes e curiosos —, as atividades convidam cada participante a descobrir, com as próprias mãos, os processos que deram rosto a tantas vozes da cultura brasileira.",
        "Mais do que ensinar técnicas, as oficinas propõem um modo de olhar: perceber como uma capa de disco conta uma história, como uma ilustração resiste à censura, como a imagem pode ser instrumento de afeto e cidadania. É a educação pela arte em ação, fiel à crença de Elifas de que criar é também um gesto político e generoso. Acompanhe a abertura de novas turmas e inscreva-se para participar. [verificar data] e formato das próximas oficinas junto à equipe educativa do Instituto.",
      ]}
    />
  ),
});
