// Vozes disponíveis para a áudio-descrição (ElevenLabs, modelo multilingual).
// Nome amigável -> ID da voz. Apenas estes IDs são aceitos na regeneração.
// Somente vozes brasileiras (pt-BR) e as vozes próprias da conta.

export interface Voz {
  id: string;
  nome: string;
  descricao: string;
  genero: "feminina" | "masculina";
}

export const VOZES: Voz[] = [
  // Brasileiras (profissionais, pt-BR)
  {
    id: "7eUAxNOneHxqfyRS77mW",
    nome: "Carla (Conversacional)",
    descricao: "feminina, conversacional",
    genero: "feminina",
  },
  {
    id: "KHmfNHtEjHhLK9eER20w",
    nome: "Fernanda",
    descricao: "feminina, formal e neutra",
    genero: "feminina",
  },
  {
    id: "x8FWrDHAK5xiFTJLpnHq",
    nome: "Carla (Rural)",
    descricao: "feminina, dinâmica e articulada",
    genero: "feminina",
  },
  {
    id: "gX4eTo1XOTTALJXnDro4",
    nome: "Mulher Brasileira",
    descricao: "feminina, adulta",
    genero: "feminina",
  },
  {
    id: "KITnmtUQzTcNTfun1PuL",
    nome: "Israela",
    descricao: "feminina, clara",
    genero: "feminina",
  },
  {
    id: "RGymW84CSmfVugnA5tvA",
    nome: "Roberta",
    descricao: "feminina, conversacional",
    genero: "feminina",
  },
  {
    id: "lWq4KDY8znfkV0DrK8Vb",
    nome: "Yasmin",
    descricao: "feminina, brasileira",
    genero: "feminina",
  },
  {
    id: "4J31DrhygVjvFsoj7BsM",
    nome: "Eduardo S.",
    descricao: "masculina, claro e profissional",
    genero: "masculina",
  },
  {
    id: "GIuLCSVfgJaUuh7hYOY8",
    nome: "Lucas",
    descricao: "masculina, narrador profundo",
    genero: "masculina",
  },
  {
    id: "rVRk0uJAtO8T38Gm03mf",
    nome: "Danilo Tenfen",
    descricao: "masculina, voz documental",
    genero: "masculina",
  },
  // Minhas vozes (clonadas/geradas na conta)
  {
    id: "7RayHCB0HjokjhjlhgJh",
    nome: "Clau Q 2",
    descricao: "feminina, clonada",
    genero: "feminina",
  },
  {
    id: "YByYS1BfwsfB4yG6Npgc",
    nome: "Olivia G",
    descricao: "feminina, clonada",
    genero: "feminina",
  },
  {
    id: "AXnnxJ1JdrlSrvHJCGaq",
    nome: "Claudia Q",
    descricao: "feminina, clonada",
    genero: "feminina",
  },
  {
    id: "vofTy3egc8t4WQffImNo",
    nome: "Nelma Narradora",
    descricao: "feminina, gerada",
    genero: "feminina",
  },
  {
    id: "QCSfV4N2pgkM9p49cZS1",
    nome: "Voz Tratamento Esgoto",
    descricao: "clonada",
    genero: "feminina",
  },
  {
    id: "sVgLvEbz3B0k5Tfpp8vZ",
    nome: "Ricardo Porto Bank",
    descricao: "masculina, gerada",
    genero: "masculina",
  },
  {
    id: "52W17QcGf83bCDb464tN",
    nome: "Rubens Portela",
    descricao: "masculina, gerada",
    genero: "masculina",
  },
];

export const VOZ_PADRAO_ID = "7eUAxNOneHxqfyRS77mW"; // Carla (Conversacional)

const IDS_VALIDOS = new Set(VOZES.map((v) => v.id));

export function vozValida(id: string | null | undefined): boolean {
  return !!id && IDS_VALIDOS.has(id);
}
