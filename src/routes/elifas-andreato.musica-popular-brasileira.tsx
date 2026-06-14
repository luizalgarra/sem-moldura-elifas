import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Música Popular Brasileira";
const DESC =
  "Elifas Andreato e a MPB: capas de discos e identidade visual que traduziram em imagem a alma da música popular brasileira.";
const URL =
  "https://institutoelifasandreato.org.br/elifas-andreato/musica-popular-brasileira";

export const Route = createFileRoute(
  "/elifas-andreato/musica-popular-brasileira",
)({
  head: () => ({
    meta: [
      { title: "Música Popular Brasileira — Elifas Andreato" },
      { name: "description", content: DESC },
      {
        property: "og:title",
        content: "Música Popular Brasileira — Elifas Andreato",
      },
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
        "Poucos artistas estiveram tão próximos da Música Popular Brasileira quanto Elifas Andreato. Ao longo de sua carreira, criou centenas de capas de discos [verificar quantidade] que se tornaram parte indissociável da memória sonora do país. Em parceria com nomes fundamentais da MPB — entre eles Paulinho da Viola, Martinho da Vila e Clementina de Jesus [confirmar fonte] —, soube ouvir antes de desenhar, traduzindo sons, letras e vozes em imagens que ampliavam o sentido da própria música.",
        "Suas capas não eram embalagens, mas extensões visuais da obra musical. Com retratos sensíveis e composições que valorizavam a cultura popular, a negritude, o samba e as raízes brasileiras, Elifas ajudou a construir a identidade visual da MPB em um período decisivo de afirmação cultural. Cada disco ganhava, sob seu olhar, um rosto e uma alma — registros afetivos que hoje permanecem na memória de gerações de ouvintes.",
        "Esse diálogo entre imagem e som é um dos eixos centrais do acervo preservado pelo Instituto Elifas Andreato. Mais do que documentar uma época, essas obras revelam como a arte gráfica e a música popular caminharam juntas na construção de uma cultura brasileira plural, resistente e profundamente humana.",
      ]}
    />
  ),
});
