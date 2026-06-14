import { createFileRoute, Link } from "@tanstack/react-router";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/participe")!;

const DESC =
  "Participe do Instituto Elifas Andreato: agenda, oficinas, patrocínio, boletim e contato para quem se interessa por arte, memória, educação e democracia.";
const URL = "https://institutoelifasandreato.org.br/participe";

export const Route = createFileRoute("/participe/")({
  head: () => ({
    meta: [
      { title: "Participe — Instituto Elifas Andreato" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Participe — Instituto Elifas Andreato" },
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
        Participe
      </h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          O Instituto Elifas Andreato existe para ser partilhado. Esta seção é um
          convite a diferentes públicos — pesquisadores, educadores, estudantes,
          artistas, patrocinadores, instituições culturais, profissionais de
          imprensa e cidadãos interessados em arte, memória e democracia — para
          se aproximarem de nossa missão e dela tomarem parte. Fiel ao espírito
          de Elifas, que acreditava na cultura como direito coletivo, queremos
          que o legado do artista circule, gere encontros e inspire novas
          criações.
        </p>
        <p>
          Há muitas formas de participar: acompanhar a agenda de atividades,
          inscrever-se em oficinas, apoiar projetos por meio de patrocínio,
          receber nosso boletim ou simplesmente entrar em contato para propor
          parcerias e colaborações. Cada gesto de participação ajuda a preservar
          a memória visual da cultura brasileira, a fortalecer a educação pela
          arte e a manter viva a defesa da democracia. Escolha o caminho que mais
          combina com você — e venha construir conosco.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-bold text-foreground">
        Formas de participar
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
