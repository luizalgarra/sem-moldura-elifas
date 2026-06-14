import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Contato";
const DESC =
  "Contato do Instituto Elifas Andreato: pesquisa, imprensa, parcerias, visitas, oficinas, patrocínio, cessão de imagens e colaboração institucional.";
const URL = "https://institutoelifasandreato.org.br/participe/contato";

export const Route = createFileRoute("/participe/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Participe" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Contato — Participe" },
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
        "O Instituto Elifas Andreato mantém canais de contato abertos a todos que desejam se aproximar de seu trabalho. Seja para pesquisa acadêmica, demandas de imprensa, propostas de parceria, agendamento de visitas, inscrição em oficinas, oportunidades de patrocínio, cessão de imagens, direitos de uso, doação de documentos ou colaboração institucional, nossa equipe está à disposição para orientar e encaminhar cada solicitação com atenção e cuidado. Acreditamos que o diálogo é parte essencial da preservação e da difusão da memória cultural.",
        "Para agilizar o atendimento, recomendamos que cada mensagem indique claramente o assunto e o objetivo do contato — assim conseguimos direcioná-la à área responsável e responder com a profundidade que o tema merece. Pesquisadores e instituições que desejam consultar o acervo, reproduzir obras ou propor projetos conjuntos encontram aqui o ponto de partida para uma colaboração construída com transparência e respeito ao legado de Elifas Andreato. [confirmar fonte] dos endereços, telefones e formulários oficiais de atendimento do Instituto.",
      ]}
    />
  ),
});
