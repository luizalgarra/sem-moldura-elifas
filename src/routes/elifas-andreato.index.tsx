import { createFileRoute, Link } from "@tanstack/react-router";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/elifas-andreato")!;

const DESC =
  "Elifas Andreato, artista visual, designer e capista que deu rosto à música popular, à imprensa e à resistência democrática brasileira.";
const URL = "https://institutoelifasandreato.org.br/elifas-andreato";

export const Route = createFileRoute("/elifas-andreato/")({
  head: () => ({
    meta: [
      { title: "Elifas Andreato" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Elifas Andreato" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        Elifas Andreato
      </h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          Artista visual, designer, ilustrador, capista e diretor de arte,
          Elifas Andreato é um dos personagens centrais da cultura visual
          brasileira. Sua obra atravessou a música popular, a imprensa, o teatro
          e a literatura, deixando uma marca inconfundível: a de quem soube dar
          rosto, cor e dignidade às vozes do Brasil. Mais do que ilustrar, Elifas
          interpretou seu tempo — e fez de cada imagem um gesto de sensibilidade,
          memória e compromisso com a democracia.
        </p>
        <p>
          Suas capas de discos definiram a identidade visual da Música Popular
          Brasileira, suas ilustrações editoriais transformaram ideias em imagens
          de grande força comunicativa e sua arte tornou-se, em tempos de
          censura, um território de resistência. Conhecer Elifas Andreato é
          percorrer a própria história cultural e política do país, vista pelo
          olhar generoso de um criador que acreditava na arte como direito de
          todos.
        </p>
        <p>
          Nesta seção, reunimos as diferentes dimensões de sua trajetória —
          biografia, carreira editorial, relação com a MPB, arte e resistência e
          os reconhecimentos que sua obra conquistou. Convidamos você a percorrer
          esses caminhos e a redescobrir um dos grandes nomes da arte brasileira.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-bold text-foreground">
        Conheça sua trajetória
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {grupo.itens.map((item) => (
          <li key={item.para}>
            <Link
              to={item.para}
              className="block rounded-lg border border-border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="font-medium text-foreground">{item.rotulo}</span>
              {item.descricao && (
                <span className="mt-1 block text-sm text-muted-foreground">
                  {item.descricao}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
