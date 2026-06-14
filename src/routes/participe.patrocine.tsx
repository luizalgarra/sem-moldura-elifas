import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Patrocine";
const DESC =
  "Patrocine o Instituto Elifas Andreato: leis de incentivo, parcerias culturais, adoção de projetos, exposições, educação e digitalização de acervo.";
const URL = "https://institutoelifasandreato.org.br/participe/patrocine";

export const Route = createFileRoute("/participe/patrocine")({
  head: () => ({
    meta: [
      { title: "Patrocine — Participe" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Patrocine — Participe" },
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
        "Patrocinar o Instituto Elifas Andreato é investir na preservação de um dos mais expressivos legados visuais da cultura brasileira. Oferecemos oportunidades de patrocínio, apoio institucional e parcerias culturais que dialogam com empresas, fundações, institutos e pessoas físicas. Por meio de leis de incentivo [confirmar fonte], é possível apoiar a adoção de projetos, a realização de exposições, os programas educativos, a digitalização do acervo e as ações públicas de memória — sempre com transparência, rigor na gestão e impacto cultural mensurável.",
        "Ao se associar a essa missão, cada parceiro contribui para democratizar o acesso à arte, fortalecer a educação e manter viva a defesa da democracia que orientou a obra de Elifas Andreato. O patrocínio cultural é, ao mesmo tempo, um gesto de responsabilidade social e uma forma de vincular a marca a valores duradouros: memória, cidadania, criatividade e justiça. Entre em contato para conhecer os projetos disponíveis e as formas de apoio mais adequadas ao seu perfil. [validar informação histórica] sobre incentivos fiscais aplicáveis a cada caso.",
      ]}
    />
  ),
});
