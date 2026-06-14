import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Agenda";
const DESC =
  "Agenda do Instituto Elifas Andreato: exposições, oficinas, palestras, rodas de conversa, lançamentos, visitas mediadas e ações educativas.";
const URL = "https://institutoelifasandreato.org.br/participe/agenda";

export const Route = createFileRoute("/participe/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Participe" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Agenda — Participe" },
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
        "A agenda do Instituto Elifas Andreato reúne a vida cultural que pulsa em torno do legado do artista. Nela você encontra exposições, oficinas, palestras, rodas de conversa, lançamentos, visitas mediadas, encontros educativos, ações em escolas, eventos públicos e programações especiais. Cada atividade é pensada como uma oportunidade de aproximar diferentes públicos da obra de Elifas e dos temas que a atravessam — a música popular, a imprensa, a memória política, a resistência democrática e a educação pela arte.",
        "Mais do que uma lista de datas, a agenda é um convite ao encontro. Ao participar, pesquisadores, educadores, estudantes, famílias e curiosos compartilham experiências que transformam a memória em vivência e o acervo em diálogo. Acompanhe regularmente a programação e participe das atividades presenciais e virtuais: é assim que a cultura se mantém viva, acessível e em movimento. [verificar data] das próximas programações junto à equipe do Instituto.",
      ]}
    />
  ),
});
