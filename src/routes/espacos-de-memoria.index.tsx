import { createFileRoute, Link } from "@tanstack/react-router";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/espacos-de-memoria")!;

const DESC =
  "Espaços de Memória do Instituto Elifas Andreato: criação e ativação de lugares públicos dedicados à arte, à democracia e à memória cultural brasileira.";
const URL = "https://institutoelifasandreato.org.br/espacos-de-memoria";

export const Route = createFileRoute("/espacos-de-memoria/")({
  head: () => ({
    meta: [
      { title: "Espaços de Memória — Instituto Elifas Andreato" },
      { name: "description", content: DESC },
      {
        property: "og:title",
        content: "Espaços de Memória — Instituto Elifas Andreato",
      },
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
        Espaços de Memória
      </h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          A seção Espaços de Memória reúne a atuação do Instituto Elifas
          Andreato na criação, na preservação e na ativação de lugares
          simbólicos dedicados à arte, à democracia, à cultura e à memória
          pública. Inspirados pela trajetória de Elifas — artista que fez da
          imagem um instrumento de afeto, denúncia e resistência —, entendemos
          que a memória precisa de território: ruas, praças, paredes e percursos
          onde a história se torne visível, partilhável e capaz de provocar
          reflexão. Mais do que monumentos, esses espaços são convites
          permanentes ao encontro entre as pessoas e aquilo que não se deve
          esquecer.
        </p>
        <p>
          Cada espaço de memória nasce do diálogo entre arte e cidadania.
          Trabalhamos para que a cidade se torne um lugar de reconhecimento das
          lutas pela democracia, dos direitos humanos e das contribuições
          culturais que moldaram o Brasil — da música popular à imprensa, da
          ilustração à educação. Ao transformar lugares comuns em territórios
          vivos de reflexão, o Instituto honra o legado de Elifas Andreato e
          afirma que preservar a memória é, sobretudo, um ato de futuro: uma
          forma de cuidar das próximas gerações e de manter acesa a chama da
          consciência coletiva.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-bold text-foreground">
        Conheça os espaços
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
