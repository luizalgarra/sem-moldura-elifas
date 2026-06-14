import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Governança";
const DESC =
  "A governança do Instituto Elifas Andreato pauta-se pela ética, transparência e responsabilidade pública na gestão do patrimônio cultural brasileiro.";
const URL = "https://institutoelifasandreato.org.br/instituto/governanca";

export const Route = createFileRoute("/instituto/governanca")({
  head: () => ({
    meta: [
      { title: "Governança — O Instituto" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Governança — O Instituto" },
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
        'Uma instituição cultural dedicada à salvaguarda da memória democrática do país exige, por princípio, uma governança transparente, ética e rigorosamente colaborativa. O Instituto Elifas Andreato repudia a estagnação dos "arquivos mortos"; operamos como um organismo dinâmico, cujas práticas de gestão buscam espelhar a responsabilidade pública, a origem operária e o compromisso coletivo que sempre guiaram a obra do próprio Elifas.',
        "Nossa estrutura administrativa é conduzida por uma diretoria executiva e uma curadoria técnica especializadas, aliando o afeto familiar ao pragmatismo profissional para a preservação documental e expansão tecnológica. Contamos ainda com o respaldo de um Conselho Consultivo plural e engajado, que historicamente atrai pensadores, músicos, intelectuais e líderes comunitários. Este arcabouço garante não apenas a proteção física de nosso acervo, mas assegura que todas as decisões institucionais, parcerias e projetos curatoriais mantenham a excelência estética, o rigor sociológico e as boas práticas de gestão valorizadas pelo terceiro setor.",
      ]}
    />
  ),
});
