import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Bento Andreato";
const DESC =
  "Bento Andreato, filho e sócio de Elifas Andreato: Diretor Executivo do Instituto Elifas Andreato, produtor cultural e guardião do acervo do artista.";
const URL = "https://institutoelifasandreato.org.br/instituto/bento-andreato";

export const Route = createFileRoute("/instituto/bento-andreato")({
  head: () => ({
    meta: [
      { title: "Bento Andreato — O Instituto" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Bento Andreato — O Instituto" },
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
        "Bento Andreato é filho e sócio de Elifas Andreato. Tem formação em artes visuais e pós-graduação em Design Estratégico, atuando como empresário e produtor cultural desde o ano 2000. Sua trajetória profissional inclui a realização de exposições, séries para a televisão, produção de shows e editoração de publicações, como o trabalho desenvolvido no Almanaque Brasil entre 1999 e 2017. Além disso, Bento foi presidente do Instituto Pensarte (TEIA) em 2007 e diretor da Associação dos Profissionais de Propaganda (APP).",
        "Em relação ao seu papel no Instituto Elifas Andreato, Bento ocupa o cargo de Diretor Executivo desde 2011. Ele teve um papel fundamental ao liderar, junto com sua família, o estabelecimento formal da instituição após o falecimento de seu pai. Sua atuação foi essencial para salvar o vasto e vulnerável acervo artístico de Elifas, garantindo que o Instituto opere não apenas como um arquivo estático para preservar obras físicas, mas como um repositório ativo focado em memória, pesquisa e extensão educativa.",
      ]}
    />
  ),
});
