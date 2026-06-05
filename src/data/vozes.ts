// Vozes disponíveis para a áudio-descrição (ElevenLabs, modelo multilingual).
// Nome amigável -> ID da voz. Apenas estes IDs são aceitos na regeneração.

export interface Voz {
  id: string;
  nome: string;
  descricao: string;
  genero: "feminina" | "masculina";
}

export const VOZES: Voz[] = [
  // Femininas
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    nome: "Sarah",
    descricao: "feminina, suave",
    genero: "feminina",
  },
  {
    id: "FGY2WhTYpPnrIDTdsKH5",
    nome: "Laura",
    descricao: "feminina, jovem e animada",
    genero: "feminina",
  },
  {
    id: "Xb7hH8MSUJpSbSDYk0k2",
    nome: "Alice",
    descricao: "feminina, clara (britânica)",
    genero: "feminina",
  },
  {
    id: "XrExE9yKIg1WjnnlVkGX",
    nome: "Matilda",
    descricao: "feminina, calorosa",
    genero: "feminina",
  },
  {
    id: "cgSgspJ2msm6clMCkdW9",
    nome: "Jessica",
    descricao: "feminina, expressiva",
    genero: "feminina",
  },
  {
    id: "pFZP5JQG7iQjIQuC4Bku",
    nome: "Lily",
    descricao: "feminina, suave (britânica)",
    genero: "feminina",
  },
  // Masculinas
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    nome: "George",
    descricao: "masculina, madura",
    genero: "masculina",
  },
  {
    id: "CwhRBWXzGAHq8TQ4Fs17",
    nome: "Roger",
    descricao: "masculina, natural",
    genero: "masculina",
  },
  {
    id: "IKne3meq5aSn9XLyUdCD",
    nome: "Charlie",
    descricao: "masculina, confiante (australiana)",
    genero: "masculina",
  },
  {
    id: "N2lVS1w4EtoT3dr4eOWO",
    nome: "Callum",
    descricao: "masculina, intensa",
    genero: "masculina",
  },
  {
    id: "TX3LPaxmHKxFdv7VOQHJ",
    nome: "Liam",
    descricao: "masculina, articulada",
    genero: "masculina",
  },
  {
    id: "bIHbv24MWmeRgasZH58o",
    nome: "Will",
    descricao: "masculina, amigável",
    genero: "masculina",
  },
  {
    id: "cjVigY5qzO86Huf0OWal",
    nome: "Eric",
    descricao: "masculina, clássica",
    genero: "masculina",
  },
  {
    id: "iP95p4xoKVk53GoZ742B",
    nome: "Chris",
    descricao: "masculina, casual",
    genero: "masculina",
  },
  {
    id: "nPczCjzI2devNBz1zQrb",
    nome: "Brian",
    descricao: "masculina, profunda",
    genero: "masculina",
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    nome: "Daniel",
    descricao: "masculina, locução",
    genero: "masculina",
  },
  {
    id: "pqHfZKP75CvOlQylNhV4",
    nome: "Bill",
    descricao: "masculina, narração",
    genero: "masculina",
  },
];

export const VOZ_PADRAO_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah

const IDS_VALIDOS = new Set(VOZES.map((v) => v.id));

export function vozValida(id: string | null | undefined): boolean {
  return !!id && IDS_VALIDOS.has(id);
}
