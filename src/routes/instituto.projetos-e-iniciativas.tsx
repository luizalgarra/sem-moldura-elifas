import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TITULO = "Projetos e Iniciativas";
const DESC =
  "Linha do tempo das realizações do Instituto Elifas Andreato e de Elifas Andreato, de 1970 a 2026: cultura, memória, educação e direitos humanos.";
const URL =
  "https://institutoelifasandreato.org.br/instituto/projetos-e-iniciativas";

type StatusTipo =
  | "concluido"
  | "construcao"
  | "planejado"
  | "inaugurado"
  | "operacao"
  | "aprovado";

type Projeto = {
  ano: string;
  projeto: string;
  categoria: string;
  descricao: string;
  publico: string;
  colaboradores: string;
  status: string;
  statusTipo: StatusTipo;
  fontes: string;
};

const projetos: Projeto[] = [
  {
    ano: "2026 (Planejado)",
    projeto: "Plano Anual de Atividades (PRONAC 256514)",
    categoria: "Gestão / Acervo / Cultura",
    descricao:
      "Projeto de manutenção do instituto, catalogação do acervo de 6.976 unidades e digitalização de obras.",
    publico: "Pesquisadores e público interessado em cultura brasileira",
    colaboradores:
      "Ministério da Cultura (Incentivo Federal), Bento Andreato",
    status: "Em fase de captação / Aprovado",
    statusTipo: "aprovado",
    fontes: "1",
  },
  {
    ano: "2026 (Planejado)",
    projeto: "Livro 'Lembramentos' e Web série",
    categoria: "Cultura / Audiovisual",
    descricao:
      "Produção de livro inédito e série de 12 episódios sobre as histórias das capas de disco de Elifas Andreato.",
    publico: "Público geral",
    colaboradores: "Instituto Elifas Andreato",
    status: "Planejado",
    statusTipo: "planejado",
    fontes: "1",
  },
  {
    ano: "2025 (Planejado)",
    projeto: "Calçadão do Reconhecimento",
    categoria: "Memória / Direitos Humanos",
    descricao:
      "Construção de calçadão com 1.625 tijolos gravados com nomes de ganhadores do Prêmio Vladimir Herzog.",
    publico: "Jornalistas e defensores da democracia",
    colaboradores: "Instituto Elifas Andreato, Instituto Premier",
    status: "Em construção",
    statusTipo: "construcao",
    fontes: "2",
  },
  {
    ano: "2024",
    projeto: "Espaço Cultural a Céu Aberto Elifas Andreato",
    categoria: "Cultura / Memória",
    descricao:
      "Instalação de obras (Escultura Vlado Vitorioso e Mosaico 25 de Outubro) na Praça Memorial Vladimir Herzog.",
    publico: "Público geral",
    colaboradores:
      "Instituto Premier, Coletivo Cultural Associação de Amigos da Praça Vladimir Herzog",
    status: "Inaugurado",
    statusTipo: "inaugurado",
    fontes: "2",
  },
  {
    ano: "2022",
    projeto: "Oficinas Formativas",
    categoria: "Educação",
    descricao:
      "Série de oficinas artísticas realizadas com alunos de escolas públicas no Jardim Japão em Cotia.",
    publico: "Alunos de escolas públicas",
    colaboradores: "Instituto Elifas Andreato",
    status: "Concluído",
    statusTipo: "concluido",
    fontes: "1",
  },
  {
    ano: "2020",
    projeto: "Aplicativo Almanaque Brasil",
    categoria: "Digital / Educação",
    descricao:
      "Plataforma digital com conteúdo do Almanaque Brasil voltada especificamente para uso pedagógico em sala de aula.",
    publico: "Alunos e professores",
    colaboradores: "Instituto Elifas Andreato",
    status: "Concluído",
    statusTipo: "concluido",
    fontes: "1",
  },
  {
    ano: "2019",
    projeto: "Capas do Brasil",
    categoria: "Cultura / Audiovisual",
    descricao:
      "Série de programetes para a TV Cultura narrando as histórias por trás das capas de discos famosas da MPB.",
    publico: "Espectadores da TV Cultura",
    colaboradores:
      "TV Cultura, Tom Zé, Paulinho da Viola, Martinho da Vila",
    status: "Concluído",
    statusTipo: "concluido",
    fontes: "1",
  },
  {
    ano: "2018",
    projeto: "Sarau do Elifas",
    categoria: "Cultura",
    descricao:
      "Série de shows no Sesc Pompeia onde o artista recebia músicos para os quais criou capas de discos icônicas.",
    publico: "Público geral e fãs de MPB",
    colaboradores:
      "Sesc Pompeia, Teresa Cristina, Zeca Baleiro, Toquinho, Renato Teixeira",
    status: "Concluído",
    statusTipo: "concluido",
    fontes: "1",
  },
  {
    ano: "2018",
    projeto: "A Arte Negra de Elifas Andreato",
    categoria: "Cultura / Exposição",
    descricao:
      "Exposição no Museu Afro Brasil com obras de Elifas focadas na temática, estética e cultura negra.",
    publico:
      "Público interessado em artes visuais e cultura afro-brasileira",
    colaboradores: "Emanoel Araújo, Martinho da Vila, Paulinho da Viola",
    status: "Concluído",
    statusTipo: "concluido",
    fontes: "1",
  },
  {
    ano: "2011",
    projeto: "Mobilização Praça Memorial Vladimir Herzog",
    categoria: "Memória / Direitos Humanos",
    descricao:
      "Mobilização para renomeação da praça e proposta de espaço de memória a céu aberto em homenagem a Herzog.",
    publico: "Cidadãos de São Paulo e defensores de direitos humanos",
    colaboradores:
      "Clarice Herzog, Elifas Andreato, Coletivo Cultural Associação de Amigos da Praça Vladimir Herzog",
    status: "Iniciado em 2011; inaugurado em 2024",
    statusTipo: "inaugurado",
    fontes: "2",
  },
  {
    ano: "1999 – 2017",
    projeto: "Almanaque Brasil",
    categoria: "Educação / Cultura",
    descricao:
      "Edição de publicação de cultura popular distribuída em voos da TAM e utilizada em contextos educativos.",
    publico: "Passageiros da TAM e estudantes",
    colaboradores: "Bento Andreato, Editora Globo",
    status: "Concluído",
    statusTipo: "concluido",
    fontes: "1",
  },
  {
    ano: "1982",
    projeto: "Volta de Dulcina",
    categoria: "Cultura",
    descricao:
      "Projeto artístico realizado em colaboração para o retorno da atriz Dulcina de Moraes aos palcos teatrais.",
    publico: "Público de teatro",
    colaboradores: "Bibi Ferreira, Dulcina de Moraes",
    status: "Concluído",
    statusTipo: "concluido",
    fontes: "1",
  },
  {
    ano: "1981",
    projeto: "Clara Mestiça",
    categoria: "Cultura",
    descricao:
      "Criação de cenário e projeto visual para o último espetáculo da cantora Clara Nunes.",
    publico: "Público de música brasileira",
    colaboradores: "Bibi Ferreira, Clara Nunes",
    status: "Concluído",
    statusTipo: "concluido",
    fontes: "1",
  },
  {
    ano: "1970 – 1980",
    projeto: "Imprensa Alternativa (Opinião, Argumento, Movimento)",
    categoria: "Cultura / Política",
    descricao:
      "Criação de identidade visual, ilustrações e direção gráfica para jornais de resistência à ditadura militar.",
    publico:
      "Militantes, intelectuais e leitores da imprensa alternativa",
    colaboradores:
      "Elifas Andreato (fundador), equipe dos jornais Opinião, Argumento e Movimento",
    status: "Concluído; legado histórico de resistência",
    statusTipo: "concluido",
    fontes: "1, 3, 4",
  },
  {
    ano: "Não especificado",
    projeto: "Cursos Digitais e Área do Aluno",
    categoria: "Educação / Digital",
    descricao:
      "Plataforma de cursos online sobre artes gráficas, história da resistência e formação cívica.",
    publico: "Estudantes de diversas regiões do Brasil",
    colaboradores: "Fundação Perseu Abramo, Instituto Elifas Andreato",
    status: "Em operação",
    statusTipo: "operacao",
    fontes: "3, 5",
  },
];

const fontes = [
  "Documentação e materiais do Instituto Elifas Andreato.",
  "Registros do Coletivo Cultural Associação de Amigos da Praça Vladimir Herzog e do Instituto Premier.",
  "Acervo de imprensa e publicações da imprensa alternativa.",
  "Documentação histórica dos jornais Opinião, Argumento e Movimento.",
  "Fundação Perseu Abramo.",
];

const statusVariant: Record<
  StatusTipo,
  "default" | "secondary" | "outline"
> = {
  concluido: "secondary",
  construcao: "default",
  planejado: "outline",
  inaugurado: "default",
  operacao: "default",
  aprovado: "outline",
};

export const Route = createFileRoute("/instituto/projetos-e-iniciativas")({
  head: () => ({
    meta: [
      { title: "Projetos e Iniciativas — O Instituto" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Projetos e Iniciativas — O Instituto" },
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        Projetos e Iniciativas
      </h1>
      <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">
        Linha do tempo das principais realizações de Elifas Andreato e do
        Instituto que leva seu nome, entre 1970 e 2026 — abrangendo cultura,
        memória, educação, audiovisual e direitos humanos.
      </p>

      <div className="mt-8 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Ano</TableHead>
              <TableHead className="min-w-[200px]">Projeto / Iniciativa</TableHead>
              <TableHead className="min-w-[150px]">Categoria</TableHead>
              <TableHead className="min-w-[280px]">Descrição</TableHead>
              <TableHead className="min-w-[200px]">Público-Alvo</TableHead>
              <TableHead className="min-w-[220px]">
                Principais Colaboradores
              </TableHead>
              <TableHead className="min-w-[160px]">Status / Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projetos.map((p, i) => (
              <TableRow key={i}>
                <TableCell className="align-top font-medium text-foreground">
                  {p.ano}
                </TableCell>
                <TableCell className="align-top font-medium text-foreground">
                  {p.projeto}
                </TableCell>
                <TableCell className="align-top text-muted-foreground">
                  {p.categoria}
                </TableCell>
                <TableCell className="align-top text-muted-foreground">
                  {p.descricao}
                </TableCell>
                <TableCell className="align-top text-muted-foreground">
                  {p.publico}
                </TableCell>
                <TableCell className="align-top text-muted-foreground">
                  {p.colaboradores}
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant={statusVariant[p.statusTipo]}>
                    {p.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-bold text-foreground">Fontes</h2>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          {fontes.map((f, i) => (
            <li key={i}>
              <span className="font-medium text-foreground">{i + 1}.</span> {f}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
