import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Rede de Parceiros";
const DESC =
  "Descubra a rede de parceiros do Instituto Elifas Andreato. Universidades, museus, empresas e coletivos unidos para ampliar o acesso à cultura nacional.";
const URL = "https://institutoelifasandreato.org.br/instituto/rede-de-parceiros";

export const Route = createFileRoute("/instituto/rede-de-parceiros")({
  head: () => ({
    meta: [
      { title: "Rede de Parceiros — O Instituto" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Rede de Parceiros — O Instituto" },
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
        "A arte de Elifas Andreato nunca foi fruto de um isolamento individualista; ela nasceu no chão de fábrica, nas redações de jornais de resistência e nas rodas de samba, em comunhão com trabalhadores gráficos e mestres da música. Seguindo essa mesma epistemologia colaborativa, o Instituto constrói continuamente uma robusta rede de parceiros institucionais, culturais, educacionais, públicos e privados. É a união de múltiplos atores sociais que permite transcender limites físicos e amplificar o alcance transformador de nosso legado.",
        "As pontes que edificamos unem desde o ecossistema tecnológico global — por meio de plataformas como o Google Arts & Culture, que democratiza nosso acervo para o mundo —, até o rigor acadêmico de universidades, como o Acordo de Cooperação Técnica firmado com o Centro Universitário Belas Artes para pesquisa estudantil. Operamos ombro a ombro com museus renomados (como o Museu Afro Brasil), empresas patrocinadoras com visão social e coletivos culturais independentes, a exemplo da nossa atuação cívica permanente ao lado do Instituto Vladimir Herzog. Convidamos patrocinadores, escolas e ativistas a se somarem a essa teia plural para garantir que a cultura brasileira seja sempre celebrada e protegida.",
      ]}
    />
  ),
});
