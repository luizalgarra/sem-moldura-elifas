import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Laura Andreato";
const DESC =
  "Laura Andreato, filha de Elifas Andreato: curadora adjunta, pesquisadora e finalizadora do legado visual do artista no Instituto Elifas Andreato.";
const URL = "https://institutoelifasandreato.org.br/instituto/laura-andreato";

export const Route = createFileRoute("/instituto/laura-andreato")({
  head: () => ({
    meta: [
      { title: "Laura Andreato — O Instituto" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Laura Andreato — O Instituto" },
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
        "Laura Andreato (ou Laura Huzak Andreato) é filha do artista Elifas Andreato. Artista plástica, educadora e pesquisadora, tem formação em Artes Plásticas pela Escola de Comunicações e Artes da USP (ECA-USP), onde também concluiu o mestrado em Poéticas Visuais e realiza o seu doutorado. Como autora, escreveu o livro Pelos Olhos de Minha Mãe.",
        "No âmbito do Instituto Elifas Andreato, Laura desempenha uma função vital, atuando como curadora adjunta, pesquisadora e finalizadora do legado visual da família. Seu papel central é garantir que a obra de seu pai não seja apenas preservada, mas que a sua dimensão e memória visual continuem sempre vivas, gerando discussões e circulando pela sociedade.",
        "Finalização de obras póstumas: Laura foi a responsável por dar o acabamento visual derradeiro — com ilustrações e pinceladas digitais — ao livro infantil inédito de seu pai, Lábaro: O enigma da bandeira brasileira, que aborda o significado cívico da nossa bandeira.",
        "Arqueologia e repatriação do acervo: Laura atua de forma obstinada na busca e negociação para recuperar obras originais dispersas de Elifas, com o intuito de reintegrá-las à coleção oficial da família. Foi ela quem entrou em contato com a compradora que encontrou a famosa ilustração de Geraldo Vandré por R$ 5 em um bazar, tentando repatriar a arte para disponibilizá-la ao público e a estudantes no Centro Universitário Belas Artes.",
        "Mediação de ações artísticas e engajamento: Laura representa o Instituto em eventos públicos e atua na mediação de intervenções culturais, como a ação artística coletiva \"Árvore da Vida\", conduzida na Praça Memorial Vladimir Herzog. Essa ação usou o legado do pai — uma mão vermelha desenhada na época em que era operário — para alertar a sociedade sobre os altos índices de acidentes e mortes no trabalho.",
      ]}
    />
  ),
});
