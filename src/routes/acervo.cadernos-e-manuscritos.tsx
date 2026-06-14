import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Cadernos e Manuscritos";
const DESC =
  "Cadernos, anotações, rascunhos e manuscritos de Elifas Andreato: documentos de processo que revelam seu pensamento visual e a construção da obra.";
const URL =
  "https://institutoelifasandreato.org.br/acervo/cadernos-e-manuscritos";

export const Route = createFileRoute("/acervo/cadernos-e-manuscritos")({
  head: () => ({
    meta: [
      { title: "Cadernos e Manuscritos — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Cadernos e Manuscritos — Acervo" },
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
        "Esta coleção reúne cadernos, anotações, manuscritos, estudos, rascunhos, ideias preliminares e documentos do processo criativo de Elifas Andreato. São páginas onde a obra ainda está nascendo: esboços que buscam um gesto, anotações que registram uma intuição, variações que testam composições, cores e palavras. Mais íntimos do que as peças finalizadas, esses materiais revelam o pensamento visual do artista em estado bruto — o caminho, muitas vezes sinuoso, entre a primeira ideia e a imagem que se tornaria pública.",
        "Para o estudo da arte e da cultura brasileira, esses documentos têm valor inestimável. Eles permitem compreender como Elifas pensava, decidia e construía suas capas, ilustrações e quadros, mostrando o trabalho, a pesquisa e a sensibilidade por trás de cada resultado. Ao preservar e disponibilizar cadernos e manuscritos, o Instituto oferece a pesquisadores, educadores e estudantes uma fonte primária preciosa e, ao público, a oportunidade rara de acompanhar de perto a gênese de uma obra que ajudou a dar rosto à memória afetiva, musical e democrática do Brasil.",
      ]}
    />
  ),
});
