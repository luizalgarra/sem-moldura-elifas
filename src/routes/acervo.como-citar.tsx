import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Como Citar";
const DESC =
  "Orientações para citar obras, imagens e documentos do acervo de Elifas Andreato: atribuição autoral, referência ao Instituto e direitos de uso.";
const URL = "https://institutoelifasandreato.org.br/acervo/como-citar";

export const Route = createFileRoute("/acervo/como-citar")({
  head: () => ({
    meta: [
      { title: "Como Citar — Acervo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Como Citar — Acervo" },
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
        "Citar corretamente uma obra é um ato de respeito — ao artista que a criou, à instituição que a preserva e ao público que dela se beneficia. Ao utilizar obras, imagens, documentos ou materiais do acervo do Instituto Elifas Andreato em pesquisas, publicações, aulas, exposições ou conteúdos digitais, pedimos que a autoria de Elifas Andreato seja sempre reconhecida e que a fonte seja atribuída ao Instituto. Esse cuidado preserva a verdade histórica, valoriza o trabalho do artista e fortalece a cadeia de confiança que sustenta a pesquisa séria e a difusão responsável da cultura brasileira.",
        "Recomendamos que cada referência inclua, sempre que possível, o título ou descrição da obra, a técnica e o suporte, a data [verificar data], o nome do autor (Elifas Andreato), a indicação \"Acervo do Instituto Elifas Andreato\" e o endereço de acesso digital, quando houver. O uso de imagens e documentos deve observar os direitos de uso aplicáveis e preservar a integridade das informações — sem cortes, alterações ou descontextualizações que comprometam o sentido original das obras. Em caso de dúvidas sobre permissões, finalidades comerciais ou usos específicos, recomendamos entrar em contato com o Instituto, que orientará sobre as condições adequadas. [confirmar fonte] sobre eventual política formal de direitos e licenciamento.",
      ]}
    />
  ),
});
