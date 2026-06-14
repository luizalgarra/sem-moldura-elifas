import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Missão e Legado";
const DESC =
  "Conheça a missão do Instituto Elifas Andreato: preservar e difundir o legado do artista, unindo arte, música popular, educação e resistência democrática.";
const URL = "https://institutoelifasandreato.org.br/instituto/missao-e-legado";

export const Route = createFileRoute("/instituto/missao-e-legado")({
  head: () => ({
    meta: [
      { title: "Missão e Legado — O Instituto" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Missão e Legado — O Instituto" },
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
        'A missão central do Instituto Elifas Andreato (IEA) é reconhecer, salvaguardar e amplificar o imenso legado deixado pelo artista para a cultura e a educação no Brasil, sempre com bases firmemente consolidadas na cidadania e na defesa intransigente dos direitos humanos. Compreendemos que a arte não deve se restringir às paredes das galerias, mas deve pulsar nas ruas, nas escolas e nos lares. Por isso, nossa atuação diária é pautada na ativação pública desse acervo, garantindo que as "perspectivas multicoloridas" de Elifas continuem a dialogar com as novas gerações e a combater as desigualdades do país.',
        "O legado de Elifas ultrapassa a sua inquestionável dimensão estética; ele é um vocabulário vivo da memória cultural, política e afetiva do Brasil. Ao traduzir visualmente as harmonias e os batuques dos maiores nomes da Música Popular Brasileira (MPB) — desenhando a alma de figuras como Paulinho da Viola, Martinho da Vila e Clementina de Jesus — e ao denunciar corajosamente as mazelas e a tortura durante os Anos de Chumbo da ditadura civil-militar, Elifas forjou uma iconografia de resistência. O Instituto existe para garantir que essa poética da indignação e do afeto permaneça como um farol de liberdade e justiça social.",
      ]}
    />
  ),
});
