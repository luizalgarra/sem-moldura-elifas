import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Capas de Discos e Revistas";
const DESC =
  "Coleção de capas de discos e revistas criadas por Elifas Andreato: documentos artísticos e históricos da música e da imprensa brasileira.";
const URL =
  "https://institutoelifasandreato.org.br/acervo/capas-de-discos-e-revistas";

export const Route = createFileRoute("/acervo/capas-de-discos-e-revistas")({
  head: () => ({
    meta: [
      { title: "Capas de Discos e Revistas — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Capas de Discos e Revistas — Acervo" },
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
        "A coleção de capas de discos, revistas e publicações reúne algumas das criações mais reconhecidas de Elifas Andreato. Foi nas capas de discos que o artista ajudou a definir a identidade visual da Música Popular Brasileira, dando rosto e atmosfera a obras de grandes intérpretes e compositores [confirmar fonte sobre artistas e títulos]. Cada capa é uma síntese rara entre música e imagem: traduz, em cor e traço, a emoção contida nos sulcos do vinil e convida o público a entrar no universo sonoro antes mesmo da primeira audição.",
        "Reunidas em acervo, essas peças revelam a história visual da música, da imprensa e da cultura brasileira ao longo de décadas [verificar período]. Funcionam, simultaneamente, como documentos artísticos — testemunhos do refinamento gráfico de Elifas — e históricos, registrando estéticas, debates e sensibilidades de cada época. Capas de revistas e publicações ampliam esse panorama, mostrando como o artista dialogou com o jornalismo, a literatura e a vida pública do país. Preservá-las é guardar a memória de um Brasil que se expressou também pela beleza e pela inteligência do design.",
      ]}
    />
  ),
});
