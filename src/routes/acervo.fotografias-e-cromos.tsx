import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Fotografias e Cromos";
const DESC =
  "Fotografias, cromos e registros visuais do acervo de Elifas Andreato: imagens de processo, retratos e documentação para pesquisa e curadoria.";
const URL = "https://institutoelifasandreato.org.br/acervo/fotografias-e-cromos";

export const Route = createFileRoute("/acervo/fotografias-e-cromos")({
  head: () => ({
    meta: [
      { title: "Fotografias e Cromos — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Fotografias e Cromos — Acervo" },
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
        "Este conjunto reúne fotografias, cromos, registros visuais, imagens de processo, documentação de obras, bastidores, retratos e demais materiais iconográficos ligados à trajetória de Elifas Andreato. São imagens que revelam o artista em movimento — diante da prancheta, em meio a estudos e provas de cor, no convívio com músicos, jornalistas e intelectuais — e que ajudam a reconstituir o ambiente cultural em que sua obra ganhou forma. Os cromos e as reproduções fotográficas guardam, ainda, etapas técnicas de criação e impressão, oferecendo um olhar privilegiado sobre o ofício gráfico.",
        "Para pesquisadores, curadores, estudantes e para o público em geral, este material possui enorme valor documental e afetivo. Ele permite contextualizar obras, datar processos, identificar colaborações e compreender as escolhas estéticas de Elifas dentro da história da arte e da cultura brasileira [validar informação histórica]. Mais do que ilustrar uma biografia, fotografias e cromos constituem fontes primárias para o estudo da memória cultural, da música popular e da resistência democrática, sustentando exposições, catálogos e pesquisas com a precisão e a sensibilidade que o legado do artista merece.",
      ]}
    />
  ),
});
