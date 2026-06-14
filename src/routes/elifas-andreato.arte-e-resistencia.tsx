import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Arte e Resistência";
const DESC =
  "A arte de Elifas Andreato como resistência democrática: memória política, defesa da liberdade e dignidade coletiva em tempos de censura.";
const URL =
  "https://institutoelifasandreato.org.br/elifas-andreato/arte-e-resistencia";

export const Route = createFileRoute("/elifas-andreato/arte-e-resistencia")({
  head: () => ({
    meta: [
      { title: "Arte e Resistência — Elifas Andreato" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Arte e Resistência — Elifas Andreato" },
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
        "Para Elifas Andreato, criar foi sempre um ato de coragem. Em meio aos anos de censura e repressão da ditadura civil-militar [validar período], sua obra tornou-se um território de resistência democrática, onde a imagem assumia o que muitas vezes as palavras não podiam dizer. Sem abrir mão da delicadeza, Elifas usou o desenho para denunciar a violência, homenagear vítimas da repressão e afirmar o valor inegociável da liberdade.",
        "Sua arte dialoga diretamente com os direitos humanos, a justiça social e a dignidade coletiva. Ao dar rosto e voz a quem foi silenciado, transformou a memória política em matéria viva, recusando o esquecimento como forma de violência. Cada traço carregava uma ética: a de que a cultura é também um campo de disputa e que a beleza pode — e deve — estar a serviço da consciência e da emancipação.",
        "Esse compromisso ético e estético é parte essencial do legado que o Instituto Elifas Andreato preserva e difunde. Mais do que documentos do passado, essas obras são instrumentos de educação para a democracia, lembrando às novas gerações que a defesa da liberdade e dos direitos é uma tarefa permanente — e que a arte tem papel decisivo nessa construção.",
      ]}
    />
  ),
});
