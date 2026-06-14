export type SubItem = {
  rotulo: string;
  para: string;
  descricao?: string;
};

export type GrupoNav = {
  rotulo: string;
  para: string;
  itens: SubItem[];
};

export const navegacao: GrupoNav[] = [
  {
    rotulo: "O Instituto",
    para: "/instituto",
    itens: [
      { rotulo: "Missão e Legado", para: "/instituto/missao-e-legado" },
      {
        rotulo: "Laura Andreato",
        para: "/instituto/laura-andreato",
        descricao: "Curadoria, pesquisa e finalização do legado",
      },
      {
        rotulo: "Bento Andreato",
        para: "/instituto/bento-andreato",
        descricao: "Diretor Executivo e produtor cultural",
      },
      {
        rotulo: "Pilares",
        para: "/instituto/pilares",
        descricao: "Preservação, Difusão, Ação Educativa",
      },
      {
        rotulo: "Projetos e Iniciativas",
        para: "/instituto/projetos-e-iniciativas",
        descricao: "Linha do tempo de realizações (1970–2026)",
      },
      { rotulo: "Governança", para: "/instituto/governanca" },
      { rotulo: "Rede de Parceiros", para: "/instituto/rede-de-parceiros" },
      { rotulo: "Transparência", para: "/instituto/transparencia" },
    ],
  },
  {
    rotulo: "Elifas Andreato",
    para: "/elifas-andreato",
    itens: [
      { rotulo: "Biografia", para: "/elifas-andreato/biografia" },
      { rotulo: "Carreira Editorial", para: "/elifas-andreato/carreira-editorial" },
      {
        rotulo: "Música Popular Brasileira",
        para: "/elifas-andreato/musica-popular-brasileira",
      },
      { rotulo: "Arte e Resistência", para: "/elifas-andreato/arte-e-resistencia" },
      { rotulo: "Reconhecimentos", para: "/elifas-andreato/reconhecimentos" },
    ],
  },
  {
    rotulo: "Acervo",
    para: "/acervo",
    itens: [
      { rotulo: "Busca", para: "/acervo/busca" },
      {
        rotulo: "Capas de Discos e Revistas",
        para: "/acervo/capas-de-discos-e-revistas",
      },
      { rotulo: "Fotografias e Cromos", para: "/acervo/fotografias-e-cromos" },
      { rotulo: "Quadros e Ilustrações", para: "/acervo/quadros-e-ilustracoes" },
      { rotulo: "Cadernos e Manuscritos", para: "/acervo/cadernos-e-manuscritos" },
      { rotulo: "Exposições Virtuais", para: "/acervo/exposicoes-virtuais" },
      { rotulo: "Conservação e Restauro", para: "/acervo/conservacao-e-restauro" },
      { rotulo: "Como Citar", para: "/acervo/como-citar" },
      { rotulo: "Datasets e Downloads", para: "/acervo/datasets-e-downloads" },
    ],
  },
  {
    rotulo: "Espaços de Memória",
    para: "/espacos-de-memoria",
    itens: [
      {
        rotulo: "Praça Memorial Vladimir Herzog",
        para: "/espacos-de-memoria/praca-memorial-vladimir-herzog",
        descricao:
          "Vlado Vitorioso · Mosaico 25 de Outubro · Calçadão do Reconhecimento · Espaço Cultural a Céu Aberto",
      },
    ],
  },
  {
    rotulo: "Participe",
    para: "/participe",
    itens: [
      { rotulo: "Agenda", para: "/participe/agenda" },
      { rotulo: "Oficinas", para: "/participe/oficinas" },
      { rotulo: "Patrocine", para: "/participe/patrocine" },
      { rotulo: "Boletim", para: "/participe/boletim" },
      { rotulo: "Contato", para: "/participe/contato" },
    ],
  },
];
