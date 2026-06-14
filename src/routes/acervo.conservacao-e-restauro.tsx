import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Conservação e Restauro";
const DESC =
  "Conservação preventiva, restauro, digitalização e documentação técnica do acervo de Elifas Andreato: o compromisso do Instituto com a preservação de longo prazo.";
const URL =
  "https://institutoelifasandreato.org.br/acervo/conservacao-e-restauro";

export const Route = createFileRoute("/acervo/conservacao-e-restauro")({
  head: () => ({
    meta: [
      { title: "Conservação e Restauro — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Conservação e Restauro — Acervo" },
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
        "Preservar a obra de Elifas Andreato é uma responsabilidade que o Instituto assume em duas dimensões inseparáveis: a integridade física e a integridade simbólica das obras. No plano material, isso se traduz em práticas de conservação preventiva — controle de temperatura, umidade e luz; higienização cuidadosa; acondicionamento em materiais adequados; e o manuseio criterioso de papéis, originais, cromos e suportes frágeis. Quando o tempo ou as condições anteriores deixaram marcas, intervenções de restauro são conduzidas com critério técnico e ética patrimonial, respeitando sempre a história e a autenticidade de cada peça, sem apagar os vestígios que também são memória.",
        "À conservação física soma-se a preservação digital. A digitalização em alta qualidade, acompanhada de documentação técnica rigorosa, garante que o acervo possa ser estudado e difundido sem expor os originais a riscos desnecessários, além de assegurar sua sobrevivência para o futuro. Cada obra é registrada com informações sobre estado de conservação, técnicas, materiais e intervenções realizadas, formando uma memória técnica que orienta decisões responsáveis ao longo do tempo. Ao cuidar desse patrimônio, o Instituto não preserva apenas imagens: protege um capítulo essencial da arte brasileira, da Música Popular Brasileira e da história democrática do país, para que continue acessível às próximas gerações.",
      ]}
    />
  ),
});
