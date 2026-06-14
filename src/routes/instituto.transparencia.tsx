import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Transparência";
const DESC =
  "Transparência e prestação de contas do Instituto Elifas Andreato. Acompanhe nossos relatórios, captação de recursos e projetos culturais incentivados.";
const URL = "https://institutoelifasandreato.org.br/instituto/transparencia";

export const Route = createFileRoute("/instituto/transparencia")({
  head: () => ({
    meta: [
      { title: "Transparência — O Instituto" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Transparência — O Instituto" },
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
        "Cuidar da memória de Elifas Andreato é preservar a cultura nacional e a luta ininterrupta pela democracia. Assumir tal responsabilidade exige do Instituto Elifas Andreato um pacto inegociável com a transparência institucional, a lisura administrativa e a prestação de contas. Como uma Organização da Sociedade Civil (OSC) que carrega o status de utilidade pública, nosso compromisso público passa pelo rigor com o qual planejamos, captamos e executamos cada ação destinada a devolver a arte à população.",
        "Todos os nossos projetos e parcerias — desde o restauro minucioso de uma matriz analógica até a realização de grandes planos anuais amparados por leis de incentivo fiscal — são estruturados sob severos relatórios de atividades e métricas de impacto sociocultural. Oferecemos contrapartidas claras e cotas de patrocínio abertas ao escrutínio, construindo relações de confiança mútua com agentes públicos e privados. Ao investir no IEA, nossos patrocinadores e a sociedade civil têm a certeza de estarem fomentando uma gestão íntegra, voltada unicamente à perpetuação e à democratização da memória cultural, afetiva e cívica do Brasil.",
      ]}
    />
  ),
});
