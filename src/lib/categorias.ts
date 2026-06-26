import type { ObraAcervo } from "@/lib/admin-obras.functions";

// ---------------------------------------------------------------------------
// Tipos de categoria
// ---------------------------------------------------------------------------

export type Tipo =
  | "pinturas"
  | "ilustracao"
  | "colagens"
  | "madeira"
  | "fotografia"
  | "audiovisual";

export type Funcao =
  | "mpb"
  | "imprensa"
  | "cartazes"
  | "autoral"
  | "audiovisual";

export type Periodo = "1960-70" | "1980" | "1990-2000" | "2010+" | "sem-data";

export const TIPOS: { valor: Tipo; rotulo: string }[] = [
  { valor: "pinturas", rotulo: "Pinturas" },
  { valor: "ilustracao", rotulo: "Ilustração gráfica" },
  { valor: "colagens", rotulo: "Colagens & recortes" },
  { valor: "madeira", rotulo: "Madeira" },
  { valor: "fotografia", rotulo: "Fotografia & mídia mista" },
  { valor: "audiovisual", rotulo: "Audiovisual" },
];

export const FUNCOES: { valor: Funcao; rotulo: string }[] = [
  { valor: "mpb", rotulo: "MPB / Capas de disco" },
  { valor: "imprensa", rotulo: "Imprensa & editorial" },
  { valor: "cartazes", rotulo: "Cartazes & teatro" },
  { valor: "autoral", rotulo: "Arte autoral" },
  { valor: "audiovisual", rotulo: "Audiovisual" },
];

export const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: "1960-70", rotulo: "Anos 1960–70" },
  { valor: "1980", rotulo: "Anos 1980" },
  { valor: "1990-2000", rotulo: "Anos 1990–2000" },
  { valor: "2010+", rotulo: "2010 em diante" },
];

// ---------------------------------------------------------------------------
// Normalização (grafia inconsistente da planilha de origem)
// ---------------------------------------------------------------------------

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ---------------------------------------------------------------------------
// Tipo a partir da técnica
// ---------------------------------------------------------------------------

export function tipoDaObra(obra: ObraAcervo): Tipo {
  const t = normalizar(obra.tecnica ?? "");

  if (t.includes("audiovisual") || t.includes("video")) return "audiovisual";

  // Madeira: marchetaria, escultura, pirografia, colagens em madeira
  if (
    t.includes("marchetaria") ||
    t.includes("escultura") ||
    t.includes("pirografo") ||
    t.includes("pirografia") ||
    (t.includes("madeira") && !t.includes("sob madeira") && !t.includes("sobre madeira"))
  ) {
    return "madeira";
  }

  // Colagens e recortes
  if (t.includes("colagem") || t.includes("colagens") || t.includes("recorte")) {
    return "colagens";
  }

  // Fotografia e mídia mista (foto + recursos digitais/gráficos)
  if (t.includes("foto") || t.includes("digital") || t.includes("vetor")) {
    return "fotografia";
  }

  // Ilustração gráfica: nanquim, aerógrafo, ecoline, ilustração
  if (
    t.includes("nanquim") ||
    t.includes("aerografo") ||
    t.includes("ecoline") ||
    t.includes("ilustracao") ||
    t.includes("caneta")
  ) {
    return "ilustracao";
  }

  // Pinturas: acrílica, óleo, lápis, aquarela sobre tela/madeira/papel
  if (
    t.includes("acrilic") ||
    t.includes("oleo") ||
    t.includes("tinta") ||
    t.includes("aquarela") ||
    t.includes("lapis") ||
    t.includes("plapis") ||
    t.includes("pintura")
  ) {
    return "pinturas";
  }

  return "pinturas";
}

// ---------------------------------------------------------------------------
// Período a partir do ano
// ---------------------------------------------------------------------------

export function periodoDaObra(obra: ObraAcervo): Periodo {
  const m = (obra.ano ?? "").match(/\d{4}/);
  if (!m) return "sem-data";
  const ano = Number(m[0]);
  if (ano < 1980) return "1960-70";
  if (ano < 1990) return "1980";
  if (ano < 2010) return "1990-2000";
  return "2010+";
}

// ---------------------------------------------------------------------------
// Função a partir de título/técnica + exceções manuais
// ---------------------------------------------------------------------------

/** Sobrescreve a heurística para obras específicas (ajuste curatorial). */
export const MAPA_FUNCAO_EXCECOES: Record<number, Funcao> = {
  3: "mpb", // Arca de Noé (disco infantil)
  4: "cartazes", // Equus (peça de teatro)
};

const PALAVRAS_IMPRENSA = [
  "veja",
  "isto e",
  "istoe",
  "revista",
  "manchete",
  "jornal",
  "placar",
  "realidade",
];

const PALAVRAS_CARTAZES = [
  "festival",
  "teatro",
  "show",
  "cartaz",
  "espetaculo",
  "peca",
  "opiniao",
];

const PALAVRAS_MPB = [
  "disco",
  "lp",
  "album",
  "secos e molhados",
  "samba",
  "chico",
  "caetano",
  "gil",
  "gal",
  "elis",
  "cartola",
  "paulinho",
  "nara",
  "milton",
];

export function funcaoDaObra(obra: ObraAcervo): Funcao {
  const excecao = MAPA_FUNCAO_EXCECOES[obra.num];
  if (excecao) return excecao;

  if (tipoDaObra(obra) === "audiovisual") return "audiovisual";

  const titulo = normalizar(obra.titulo ?? "");

  if (PALAVRAS_IMPRENSA.some((p) => titulo.includes(p))) return "imprensa";
  if (PALAVRAS_CARTAZES.some((p) => titulo.includes(p))) return "cartazes";
  if (PALAVRAS_MPB.some((p) => titulo.includes(p))) return "mpb";

  return "autoral";
}

// ---------------------------------------------------------------------------
// Helper combinado
// ---------------------------------------------------------------------------

export interface Classificacao {
  tipo: Tipo;
  funcao: Funcao;
  periodo: Periodo;
}

export function classificar(obra: ObraAcervo): Classificacao {
  return {
    tipo: tipoDaObra(obra),
    funcao: funcaoDaObra(obra),
    periodo: periodoDaObra(obra),
  };
}
