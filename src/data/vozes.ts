// Vozes disponíveis para a áudio-descrição (ElevenLabs, modelo multilingual).
// Nome amigável -> ID da voz. Apenas estes IDs são aceitos na regeneração.

export interface Voz {
  id: string;
  nome: string;
  descricao: string;
  genero: "feminina" | "masculina";
}

export const VOZES: Voz[] = [
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    nome: "Sarah",
    descricao: "feminina, suave",
    genero: "feminina",
  },
  {
    id: "Xb7hH8MSUJpSbSDYk0k2",
    nome: "Alice",
    descricao: "feminina, clara",
    genero: "feminina",
  },
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    nome: "George",
    descricao: "masculina, madura",
    genero: "masculina",
  },
  {
    id: "nPczCjzI2devNBz1zQrb",
    nome: "Brian",
    descricao: "masculina, grave",
    genero: "masculina",
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    nome: "Daniel",
    descricao: "masculina, locução",
    genero: "masculina",
  },
];

export const VOZ_PADRAO_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah

const IDS_VALIDOS = new Set(VOZES.map((v) => v.id));

export function vozValida(id: string | null | undefined): boolean {
  return !!id && IDS_VALIDOS.has(id);
}
