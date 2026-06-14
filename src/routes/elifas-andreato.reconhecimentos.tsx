import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Reconhecimentos";
const DESC =
  "Reconhecimentos e relevância pública da obra de Elifas Andreato: prêmios, exposições, presença em acervos e influência sobre artistas e pesquisadores.";
const URL =
  "https://institutoelifasandreato.org.br/elifas-andreato/reconhecimentos";

export const Route = createFileRoute("/elifas-andreato/reconhecimentos")({
  head: () => ({
    meta: [
      { title: "Reconhecimentos — Elifas Andreato" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Reconhecimentos — Elifas Andreato" },
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
        "A obra de Elifas Andreato conquistou ampla relevância pública e o reconhecimento de críticos, artistas e instituições ao longo das décadas. Seu trabalho recebeu prêmios e homenagens [inserir prêmios e datas] e integrou exposições dentro e fora do país [confirmar fonte], consolidando sua posição como um dos grandes nomes da arte gráfica brasileira. Mais importante do que os títulos, porém, é a forma como sua produção se tornou referência viva para quem pensa a imagem, a música e a memória do Brasil.",
        "Esse reconhecimento se expressa também na presença de suas obras em acervos, coleções e estudos acadêmicos, e na influência que exerce sobre ilustradores, designers, músicos, jornalistas e educadores. Sua trajetória é objeto de pesquisa e inspiração, lembrando que a contribuição de Elifas extrapola o campo estético e alcança a história cultural e democrática do país.",
        "O Instituto Elifas Andreato trabalha para ampliar e organizar essa memória crítica, reunindo registros, depoimentos e referências que documentam a importância do artista. Preservar esses reconhecimentos é também garantir que as próximas gerações reconheçam, na obra de Elifas, um patrimônio coletivo da cultura brasileira.",
      ]}
    />
  ),
});
