import { createFileRoute, Link } from "@tanstack/react-router";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/acervo")!;

const DESC =
  "Acervo do Instituto Elifas Andreato: capas, ilustrações, fotografias, cromos e manuscritos que preservam a memória visual da cultura brasileira.";
const URL = "https://institutoelifasandreato.org.br/acervo";

export const Route = createFileRoute("/acervo/")({
  head: () => ({
    meta: [
      { title: "Acervo — Instituto Elifas Andreato" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Acervo — Instituto Elifas Andreato" },
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
        Acervo
      </h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          O acervo do Instituto Elifas Andreato reúne, organiza e preserva o
          vasto conjunto de obras e documentos produzidos ao longo da trajetória
          do artista — capas de discos e revistas, ilustrações, quadros,
          fotografias, cromos, cadernos e manuscritos. Mais do que uma coleção,
          trata-se de um patrimônio artístico, gráfico, documental, político,
          musical e cultural brasileiro, no qual a história do país pode ser lida
          pelas imagens que Elifas dedicou às suas vozes, lutas e afetos.
        </p>
        <p>
          Cada peça deste acervo é, ao mesmo tempo, criação estética e documento
          histórico. Nas capas que deram rosto à Música Popular Brasileira, nas
          ilustrações que circularam pela imprensa em tempos de censura e nos
          estudos preliminares guardados em cadernos, encontra-se o registro de
          um Brasil que cantou, resistiu e sonhou. Preservar esse conjunto é
          assumir um compromisso com a memória cultural, com a educação pela arte
          e com a defesa da democracia — valores que orientaram a vida e a obra
          de Elifas Andreato.
        </p>
        <p>
          Trabalhamos para que este acervo seja acessível, pesquisável e vivo:
          catalogado com rigor, descrito com cuidado e aberto a pesquisadores,
          educadores, estudantes, curadores e ao público em geral. Convidamos
          você a percorrer suas coleções e a redescobrir, em cada imagem, a
          generosidade de um artista que acreditava na arte como direito de
          todos.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-bold text-foreground">
        Explore as coleções
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
