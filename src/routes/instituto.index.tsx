import { createFileRoute } from "@tanstack/react-router";
import { IndiceSecao } from "@/components/PaginaStub";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/instituto")!;

const DESC =
  "O Instituto Elifas Andreato preserva, difunde e ativa publicamente a obra do artista, guardando a memória cultural, política e afetiva do Brasil.";
const URL = "https://institutoelifasandreato.org.br/instituto";

export const Route = createFileRoute("/instituto/")({
  head: () => ({
    meta: [
      { title: "O Instituto — Elifas Andreato" },
      { name: "description", content: DESC },
      { property: "og:title", content: "O Instituto — Elifas Andreato" },
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
        O Instituto
      </h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          O Instituto Elifas Andreato nasce do compromisso de cuidar de uma das
          obras mais sensíveis e socialmente engajadas da arte gráfica
          brasileira. Mais do que um guardião de imagens, traços e matrizes, o
          Instituto é um espaço vivo de memória: existe para reconhecer,
          preservar e devolver à sociedade o vasto repertório criado por Elifas
          Andreato — artista visual, designer, ilustrador e capista que traduziu,
          em cores e silêncios, a alma da música popular, da imprensa
          independente e das lutas democráticas do país.
        </p>
        <p>
          Nossa vocação é fazer com que esse legado permaneça acessível, vivo e
          em diálogo com as novas gerações. Acreditamos que a memória cultural
          não pertence aos arquivos, mas às pessoas: por isso, atuamos na
          preservação técnica do acervo, na difusão de exposições físicas e
          virtuais e na ação educativa que transforma capas de discos,
          ilustrações e cartazes em ferramentas de aprendizado, sensibilidade e
          cidadania. Cada projeto reafirma uma convicção que guiou Elifas a vida
          inteira: a arte é um direito de todos e um instrumento de
          transformação social.
        </p>
        <p>
          Comprometido com o acesso público e a responsabilidade histórica, o
          Instituto une rigor curatorial, ética de gestão e afeto pela cultura
          brasileira. Convidamos pesquisadores, educadores, parceiros e o público
          em geral a percorrer as seções a seguir e a tomar parte nesta
          construção coletiva de memória, arte e democracia.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-bold text-foreground">
        Conheça nossas seções
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {grupo.itens.map((item) => (
          <IndiceSecaoItem key={item.para} para={item.para} />
        ))}
      </ul>
    </div>
  );
}

import { Link } from "@tanstack/react-router";

function IndiceSecaoItem({ para }: { para: string }) {
  const item = grupo.itens.find((i) => i.para === para)!;
  return (
    <li>
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
  );
}
