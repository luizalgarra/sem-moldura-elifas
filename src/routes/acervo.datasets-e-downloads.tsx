import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Datasets e Downloads";
const DESC =
  "Datasets, catálogos, imagens autorizadas e materiais educativos do acervo de Elifas Andreato: ciência aberta, pesquisa e acesso responsável à memória cultural.";
const URL =
  "https://institutoelifasandreato.org.br/acervo/datasets-e-downloads";

export const Route = createFileRoute("/acervo/datasets-e-downloads")({
  head: () => ({
    meta: [
      { title: "Datasets e Downloads — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Datasets e Downloads — Acervo" },
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
        "O Instituto Elifas Andreato entende a memória cultural como um bem comum. Por isso, trabalha para disponibilizar, de forma gradual e responsável, datasets, catálogos, arquivos de pesquisa, materiais educativos, imagens autorizadas e documentos públicos para download. Essa abertura é uma forma concreta de honrar o espírito do artista — que sempre acreditou na arte como direito de todos — e de colocar seu legado a serviço da educação, da pesquisa acadêmica e da difusão da cultura brasileira. Pesquisadores, professores, estudantes, curadores e desenvolvedores encontram aqui insumos organizados para estudar a obra de Elifas e o contexto da Música Popular Brasileira, da imprensa e da história política do país.",
        "Esse compromisso com a ciência aberta caminha lado a lado com o acesso responsável. Os materiais disponibilizados respeitam os direitos de uso, indicam claramente a autoria e a fonte, e devem ser empregados com integridade, preservando o sentido e a verdade histórica das obras. A construção desse conjunto de dados é contínua e curatorial: catalogamos, descrevemos e revisamos cada item com rigor, de modo que cada download seja também um convite à pesquisa séria e ao cuidado com a memória. Ao abrir esses recursos, o Instituto reafirma que preservar não é guardar em silêncio, mas compartilhar com responsabilidade. [validar informação histórica] e [confirmar fonte] conforme cada conjunto for publicado.",
      ]}
    />
  ),
});
