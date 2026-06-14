import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Busca";
const DESC =
  "Pesquise o acervo do Instituto Elifas Andreato: obras, capas, fotografias, manuscritos e documentos com catalogação e acessibilidade digital.";
const URL = "https://institutoelifasandreato.org.br/acervo/busca";

export const Route = createFileRoute("/acervo/busca")({
  head: () => ({
    meta: [
      { title: "Busca — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Busca — Acervo" },
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
        "A área de busca é a principal porta de entrada para o acervo do Instituto Elifas Andreato. Por meio dela, qualquer pessoa pode pesquisar obras, documentos, imagens, capas de discos e revistas, fotografias, cromos, manuscritos e demais materiais relacionados à trajetória do artista. Mais do que localizar um item, a busca permite estabelecer relações — entre uma capa e o disco que ela vestiu, entre um estudo preliminar e a obra final, entre uma ilustração e o contexto histórico em que foi criada —, revelando as muitas camadas que compõem a memória visual da cultura brasileira.",
        "Para que essa navegação seja precisa e generosa, cada item é descrito com atenção à catalogação e aos metadados: títulos, datas, técnicas, suportes, contextos de criação e palavras-chave que conectam as obras entre si e às histórias que carregam. Esse trabalho de descrição é também um gesto de cuidado com a verdade histórica e com a pesquisa séria. Comprometidos com a acessibilidade digital, buscamos oferecer descrições textuais, contraste adequado e estruturas compatíveis com tecnologias assistivas, para que o acervo de Elifas Andreato seja, de fato, um patrimônio acessível a todas as pessoas.",
      ]}
    />
  ),
});
