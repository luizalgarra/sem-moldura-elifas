import { createFileRoute } from "@tanstack/react-router";

const DESC =
  "Praça Memorial Vladimir Herzog: espaço público de memória, arte e democracia que celebra a vitória da memória sobre o esquecimento e a luta contra o autoritarismo.";
const URL =
  "https://institutoelifasandreato.org.br/espacos-de-memoria/praca-memorial-vladimir-herzog";

const ancoras = [
  {
    id: "vlado-vitorioso",
    titulo: "Vlado Vitorioso",
    paragrafos: [
      "Vladimir Herzog não é lembrado aqui apenas como vítima da violência de Estado, mas como presença ética que segue inspirando o país. Jornalista, professor e homem de cultura, Vlado tornou-se símbolo de coragem, integridade e humanidade — alguém cuja vida e cujo trabalho afirmaram o valor da verdade e da liberdade. Chamá-lo de vitorioso é reconhecer que a tentativa de silenciá-lo fracassou: sua história, em vez de apagada, multiplicou-se em consciência, mobilização e compromisso democrático.",
      "A imagem de Vlado Vitorioso traduz a vitória da memória sobre o esquecimento. Onde se quis impor o medo, floresceram a denúncia, a justiça e a solidariedade. Ao acolher essa presença no coração de um espaço público, a praça transforma a dor em ensinamento e a ausência em farol. É essa força ética que o Instituto Elifas Andreato — fiel à vocação do artista de dar rosto às causas justas — busca preservar e transmitir às novas gerações.",
    ],
  },
  {
    id: "mosaico-25-de-outubro",
    titulo: "Mosaico 25 de Outubro",
    paragrafos: [
      "O Mosaico 25 de Outubro evoca a data da morte de Vladimir Herzog [validar informação histórica] e a converte em marco simbólico de memória, denúncia e reparação. Obra coletiva, o mosaico é feito de muitas mãos e muitas histórias, à semelhança da própria luta pela democracia: nenhuma peça basta sozinha, mas juntas compõem uma imagem maior, capaz de resistir ao tempo. Cada fragmento é um gesto de não esquecimento e um compromisso renovado com a verdade e a justiça.",
      "Mais do que ornamento, o mosaico é documento e promessa. Ao reunir comunidade, artistas e cidadãos em torno de uma criação compartilhada, ele atualiza o sentido da reparação histórica e afirma que a memória é uma construção coletiva. Nessa confluência entre arte pública e consciência cívica, reconhece-se a herança de Elifas Andreato, que sempre acreditou na imagem como linguagem de pertencimento e na cultura como direito de todos.",
    ],
  },
  {
    id: "calcadao-do-reconhecimento",
    titulo: "Calçadão do Reconhecimento",
    paragrafos: [
      "O Calçadão do Reconhecimento é um percurso urbano de homenagem a pessoas e movimentos que contribuíram para a democracia, os direitos humanos e a cultura brasileira. Caminhar por ele é percorrer uma linha do tempo viva, em que jornalistas, artistas, militantes, educadores e cidadãos comuns são lembrados por sua coragem e generosidade. O espaço propõe que a gratidão se torne paisagem: que o reconhecimento, em vez de discurso passageiro, se inscreva no chão da cidade e no cotidiano de quem por ali passa.",
      "Ao transformar a caminhada em ato de memória, o calçadão convida cada visitante a se reconhecer parte dessa história. As trajetórias homenageadas dialogam com os valores que orientaram a obra de Elifas Andreato — a defesa da liberdade, o apreço pela música popular e pela imprensa, o compromisso com a educação e a justiça. É um território de pertencimento, onde a cidade aprende a honrar quem ajudou a construí-la e a sonhá-la mais livre e mais humana.",
    ],
  },
  {
    id: "espaco-cultural-a-ceu-aberto",
    titulo: "Espaço Cultural a Céu Aberto",
    paragrafos: [
      "A praça é também um espaço cultural a céu aberto, vocacionado a receber a vida em movimento: ações educativas, rodas de conversa, apresentações artísticas, visitas mediadas, encontros públicos, exposições temporárias e atividades de memória ativa. Sem muros nem ingressos, ela democratiza o acesso à arte e ao debate, fazendo do espaço comum um lugar de aprendizado, escuta e convivência. Aqui, a memória não é estática: ela acontece, se atualiza e se reinventa no encontro entre as pessoas.",
      "Essa programação aberta concretiza a crença de que a cultura é direito de todos — princípio caro a Elifas Andreato e ao Instituto que leva seu nome. Ao acolher escolas, famílias, pesquisadores, artistas e a vizinhança, o espaço cultural a céu aberto faz da praça um território pedagógico e afetivo, onde história, arte e cidadania se entrelaçam. É a memória posta em ação, transformando reflexão em experiência compartilhada e a cidade em sala de aula viva.",
    ],
  },
];

export const Route = createFileRoute(
  "/espacos-de-memoria/praca-memorial-vladimir-herzog",
)({
  head: () => ({
    meta: [
      { title: "Praça Memorial Vladimir Herzog — Espaços de Memória" },
      { name: "description", content: DESC },
      {
        property: "og:title",
        content: "Praça Memorial Vladimir Herzog — Espaços de Memória",
      },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
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
        Praça Memorial Vladimir Herzog
      </h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          A Praça Memorial Vladimir Herzog é um espaço público de memória, arte,
          democracia e reconhecimento. Nascida do desejo de transformar a dor em
          consciência, ela mantém viva a memória de Vlado — jornalista
          assassinado durante a ditadura militar [validar informação
          histórica] — e reafirma o compromisso permanente da sociedade
          brasileira com a verdade, a justiça e os direitos humanos. Mais do que
          homenagear, a praça educa: faz da cidade um território vivo de
          reflexão e cidadania, onde o passado se torna lição para o presente.
        </p>
        <p>
          Concebida no diálogo entre arte pública e luta contra o autoritarismo,
          a praça honra a vocação de Elifas Andreato de dar imagem às causas
          justas. Seus diferentes elementos — da figura de Vlado Vitorioso ao
          mosaico comemorativo, do percurso de reconhecimento à programação
          cultural a céu aberto — compõem um conjunto coerente, em que estética e
          ética caminham juntas. Convidamos você a percorrer cada parte deste
          memorial e a participar do gesto coletivo de não esquecer.
        </p>
      </div>

      <nav aria-label="Seções da página" className="mt-8">
        <ul className="flex flex-wrap gap-3 text-sm">
          {ancoras.map((a) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className="text-accent hover:underline">
                {a.titulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-12">
        {ancoras.map((a) => (
          <section key={a.id} id={a.id} className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {a.titulo}
            </h2>
            <div className="mt-3 space-y-4 leading-relaxed text-muted-foreground">
              {a.paragrafos.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
