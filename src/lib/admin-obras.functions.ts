import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getObra, ehObraFixa, obras, type Obra } from "@/data/obras";
import { VOZ_FEMININA_ID, vozValida } from "@/data/vozes";

const PRIMEIRA_CHAVE_EXTRA = 1000; // identidades internas das obras novas começam aqui
const MAX_CHAVE = 999999; // limite das identidades internas

export interface OverrideObra {
  num: number;
  titulo: string | null;
  ano: string | null;
  autor: string | null;
  tecnica: string | null;
  dimensao: string | null;
  parede: string | null;
  descricao: string | null;
  imagemPath: string | null;
  audioPath: string | null;
  audioFemPath: string | null;
  audioMascPath: string | null;
  audioTrechos: Trecho[] | null;
  vozId: string;
  updatedAt: string | null;
}

/** Voz de um trecho: feminina (Carla) ou masculina (Danilo). */
export type VozTipo = "fem" | "masc";

/** Um trecho de áudio já gerado, salvo em `audio_trechos`. */
export interface Trecho {
  ordem: number;
  rotulo: string;
  voz: VozTipo;
  path: string;
}

/** Trecho exposto ao cliente (URL pública em vez do path interno). */
export interface TrechoPublico {
  rotulo: string;
  voz: VozTipo;
  url: string;
}

/**
 * Obra pronta para exibição.
 * - `num`: número EXIBIDO (a posição na sequência; 1, 2, 3, ...).
 * - `chave`: identidade interna estável (nunca muda; usada para mídia/edição).
 */
export interface ObraAcervo extends Obra {
  chave: number;
  extra: boolean;
  audioFem: string | null;
  audioMasc: string | null;
  audioTrechos: TrechoPublico[] | null;
}

function versaoDe(updatedAt: string | null | undefined): string {
  return updatedAt
    ? new Date(updatedAt).getTime().toString()
    : Date.now().toString();
}

// ----- Divisão do texto em seções (locução alternada) -----

interface SecaoDef {
  chaves: string[];
  rotulo: string;
  voz: VozTipo;
}

/**
 * Ordem de REPRODUÇÃO: a audiodescrição abre (voz masculina) e as vozes se
 * revezam entre fato e leitura.
 */
const SECOES: SecaoDef[] = [
  {
    chaves: [
      "audiodescricao",
      "audio descricao",
      "audiodescricao da obra",
      "descricao da imagem",
    ],
    rotulo: "Audiodescrição",
    voz: "fem",
  },
  {
    chaves: ["identificacao da obra", "identificacao"],
    rotulo: "Identificação",
    voz: "fem",
  },
  {
    chaves: ["analise interpretativa", "analise"],
    rotulo: "Análise",
    voz: "fem",
  },
];

const VOZES_FALLBACK: VozTipo[] = ["fem", "fem", "fem"];
const ROTULOS_FALLBACK = ["Parte 1", "Parte 2", "Parte 3"];

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove marcações de título (#, *, :, traços) de uma linha. */
function limparTitulo(linha: string): string {
  return linha
    .replace(/^[#*\->\s]+/, "")
    .replace(/[:*\s]+$/, "")
    .trim();
}

/** Distribui parágrafos/frases em `n` blocos equilibrados por tamanho. */
function dividirEmBlocos(texto: string, n: number): string[] {
  let partes = texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (partes.length < n) {
    partes = texto
      .split(/(?<=[.!?])\s+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  if (partes.length === 0) return [];
  if (partes.length <= n) return partes;

  const total = partes.reduce((a, p) => a + p.length, 0);
  const alvo = total / n;
  const blocos: string[] = [];
  let atual = "";
  for (const parte of partes) {
    atual = atual ? `${atual}\n\n${parte}` : parte;
    if (blocos.length < n - 1 && atual.length >= alvo) {
      blocos.push(atual);
      atual = "";
    }
  }
  if (atual) blocos.push(atual);
  return blocos;
}

interface TrechoTexto {
  rotulo: string;
  voz: VozTipo;
  texto: string;
}

/**
 * Divide o texto da obra na ordem de reprodução alternada. Usa os títulos do
 * prompt quando existem; senão divide "como der" em 4 blocos alternando vozes.
 */
export function dividirTrechos(texto: string): TrechoTexto[] {
  const limpo = texto.trim();
  if (!limpo) return [];

  // Mapa normalizado: chave de seção -> índice em SECOES.
  const mapa = new Map<string, number>();
  SECOES.forEach((sec, i) => {
    for (const chave of sec.chaves) mapa.set(normalizar(chave), i);
  });

  const linhas = limpo.split(/\r?\n/);
  const capturado = new Map<number, string[]>();
  let secaoAtual = -1;
  let achouTitulo = false;

  for (const linha of linhas) {
    const titulo = limparTitulo(linha);
    const norm = normalizar(titulo);
    const idx =
      titulo.length > 0 && titulo.length <= 60 ? mapa.get(norm) : undefined;
    if (idx !== undefined) {
      secaoAtual = idx;
      achouTitulo = true;
      if (!capturado.has(idx)) capturado.set(idx, []);
      continue;
    }
    if (secaoAtual >= 0 && linha.trim()) {
      capturado.get(secaoAtual)!.push(linha.trim());
    }
  }

  if (achouTitulo) {
    const trechos: TrechoTexto[] = [];
    SECOES.forEach((sec, i) => {
      const corpo = (capturado.get(i) ?? []).join("\n").trim();
      if (corpo)
        trechos.push({ rotulo: sec.rotulo, voz: sec.voz, texto: corpo });
    });
    if (trechos.length > 0) return trechos;
  }

  // Fallback: divide em até 4 blocos alternando vozes.
  const blocos = dividirEmBlocos(limpo, 4);
  return blocos.map((texto, i) => ({
    rotulo: ROTULOS_FALLBACK[i] ?? `Parte ${i + 1}`,
    voz: VOZES_FALLBACK[i % VOZES_FALLBACK.length],
    texto,
  }));
}

type SupabaseAdmin = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

/**
 * Garante que o chamador é um administrador. Lança 401 caso contrário.
 * Usado nas funções que escrevem dados ou consomem créditos.
 */
async function garantirAdmin(context: { supabase: unknown }) {
  const cliente = context.supabase as {
    rpc: (fn: "is_admin") => Promise<{ data: boolean | null; error: unknown }>;
  };
  const { data, error } = await cliente.rpc("is_admin");
  if (error || data !== true) {
    throw new Response("Não autorizado", { status: 401 });
  }
}

/** Converte os trechos salvos no banco em URLs públicas (ou null). */
function trechosPublicos(
  raw: unknown,
  num: number,
  v: string,
): TrechoPublico[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const lista = (raw as Trecho[])
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((t, i) => ({
      rotulo: t.rotulo,
      voz: t.voz,
      url: `/api/public/obra-audio/${num}?trecho=${i}&v=${v}`,
    }));
  return lista.length > 0 ? lista : null;
}

/**
 * Monta o acervo completo (fixas + extras), já com edições aplicadas e
 * ordenado pela tabela `acervo_ordem`. O `num` de cada obra é a POSIÇÃO
 * exibida (contígua: 1..N). A `chave` é a identidade interna.
 */
async function construirAcervo(
  supabaseAdmin: SupabaseAdmin,
): Promise<ObraAcervo[]> {
  const [ocultasRes, overridesRes, extrasRes, ordemRes] = await Promise.all([
    supabaseAdmin.from("obras_ocultas").select("num"),
    supabaseAdmin
      .from("obra_overrides")
      .select(
        "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, audio_fem_path, audio_masc_path, audio_trechos, updated_at",
      ),
    supabaseAdmin
      .from("obras_extras")
      .select(
        "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, audio_fem_path, audio_masc_path, audio_trechos, updated_at",
      ),
    supabaseAdmin.from("acervo_ordem").select("chave, posicao"),
  ]);

  const ocultas = new Set((ocultasRes.data ?? []).map((r) => r.num));
  const overrides = new Map((overridesRes.data ?? []).map((r) => [r.num, r]));

  // Monta o mapa chave -> obra disponível.
  const disponiveis = new Map<number, ObraAcervo>();

  for (const obra of obras) {
    if (ocultas.has(obra.num)) continue;
    const ov = overrides.get(obra.num);
    const v = versaoDe(ov?.updated_at);
    const audioFem = ov?.audio_fem_path
      ? `/api/public/obra-audio/${obra.num}?voz=fem&v=${v}`
      : ov?.audio_url
        ? `/api/public/obra-audio/${obra.num}?v=${v}`
        : obra.audio;
    const audioMasc = ov?.audio_masc_path
      ? `/api/public/obra-audio/${obra.num}?voz=masc&v=${v}`
      : null;
    disponiveis.set(obra.num, {
      num: obra.num, // provisório; será sobrescrito pela posição
      chave: obra.num,
      titulo: ov?.titulo ?? obra.titulo,
      ano: ov?.ano ?? obra.ano,
      autor: ov?.autor ?? obra.autor,
      tecnica: ov?.tecnica ?? obra.tecnica,
      dimensao: ov?.dimensao ?? obra.dimensao,
      parede: ov?.parede ?? obra.parede,
      descricao: ov?.descricao ?? obra.descricao,
      imagem: ov?.imagem_path
        ? `/api/public/obra-imagem/${obra.num}?v=${v}`
        : obra.imagem,
      audio: audioFem,
      audioFem,
      audioMasc,
      audioTrechos: trechosPublicos(ov?.audio_trechos, obra.num, v),
      extra: false,
    });
  }

  for (const ex of extrasRes.data ?? []) {
    const v = versaoDe(ex.updated_at);
    const audioFem = ex.audio_fem_path
      ? `/api/public/obra-audio/${ex.num}?voz=fem&v=${v}`
      : ex.audio_url
        ? `/api/public/obra-audio/${ex.num}?v=${v}`
        : null;
    const audioMasc = ex.audio_masc_path
      ? `/api/public/obra-audio/${ex.num}?voz=masc&v=${v}`
      : null;
    disponiveis.set(ex.num, {
      num: ex.num,
      chave: ex.num,
      titulo: ex.titulo ?? `Obra ${ex.num}`,
      ano: ex.ano ?? "",
      autor: ex.autor ?? "Elifas Andreato",
      tecnica: ex.tecnica ?? "",
      dimensao: ex.dimensao ?? "",
      parede: ex.parede ?? "Parede 4",
      descricao: ex.descricao ?? "",
      imagem: ex.imagem_path
        ? `/api/public/obra-imagem/${ex.num}?v=${v}`
        : null,
      audio: audioFem,
      audioFem,
      audioMasc,
      audioTrechos: trechosPublicos(ex.audio_trechos, ex.num, v),
      extra: true,
    });
  }


  // Define a ordem das chaves.
  const ordemRows = (ordemRes.data ?? [])
    .slice()
    .sort((a, b) => a.posicao - b.posicao || a.chave - b.chave);

  const chavesOrdenadas: number[] = [];
  const vistas = new Set<number>();

  if (ordemRows.length > 0) {
    for (const row of ordemRows) {
      if (disponiveis.has(row.chave) && !vistas.has(row.chave)) {
        chavesOrdenadas.push(row.chave);
        vistas.add(row.chave);
      }
    }
  }

  // Acrescenta qualquer obra disponível ainda não ordenada, na ordem natural
  // (fixas pelo número original; extras pela chave). Garante consistência
  // mesmo antes da ordem ser materializada.
  for (const obra of obras) {
    if (disponiveis.has(obra.num) && !vistas.has(obra.num)) {
      chavesOrdenadas.push(obra.num);
      vistas.add(obra.num);
    }
  }
  for (const ex of (extrasRes.data ?? [])
    .slice()
    .sort((a, b) => a.num - b.num)) {
    if (disponiveis.has(ex.num) && !vistas.has(ex.num)) {
      chavesOrdenadas.push(ex.num);
      vistas.add(ex.num);
    }
  }

  // Atribui o número exibido (posição contígua).
  return chavesOrdenadas.map((chave, i) => {
    const obra = disponiveis.get(chave)!;
    return { ...obra, num: i + 1 };
  });
}

/**
 * Garante que `acervo_ordem` reflita o acervo atual. Insere as chaves que
 * ainda não estiverem na tabela, mantendo as posições existentes. Usado antes
 * de incluir/remover para que as operações sejam determinísticas.
 */
async function materializarOrdem(supabaseAdmin: SupabaseAdmin): Promise<void> {
  const acervo = await construirAcervo(supabaseAdmin);
  // `acervo` já está na ordem correta; grava posição = índice + 1 para todas.
  const linhas = acervo.map((o, i) => ({ chave: o.chave, posicao: i + 1 }));

  // Limpa e regrava para garantir posições contíguas e sem órfãos.
  await supabaseAdmin.from("acervo_ordem").delete().gte("chave", 0);
  if (linhas.length > 0) {
    await supabaseAdmin.from("acervo_ordem").insert(linhas);
  }
}

/** Lista todos os overrides salvos no banco. */
export const listarOverrides = createServerFn({ method: "GET" }).handler(
  async (): Promise<OverrideObra[]> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("obra_overrides")
      .select(
        "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, audio_fem_path, audio_masc_path, audio_trechos, voz_id, updated_at",
      )
      .order("num", { ascending: true });

    if (error) {
      console.error("listarOverrides:", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      num: row.num,
      titulo: row.titulo,
      ano: row.ano,
      autor: row.autor,
      tecnica: row.tecnica,
      dimensao: row.dimensao,
      parede: row.parede,
      descricao: row.descricao,
      imagemPath: row.imagem_path,
      audioPath: row.audio_url,
      audioFemPath: row.audio_fem_path,
      audioMascPath: row.audio_masc_path,
      audioTrechos: Array.isArray(row.audio_trechos)
        ? (row.audio_trechos as unknown as Trecho[])
        : null,
      vozId: row.voz_id,
      updatedAt: row.updated_at,
    }));
  },
);

/** Acervo final ordenado (público e página de edição). */
export const listarAcervo = createServerFn({ method: "GET" }).handler(
  async (): Promise<ObraAcervo[]> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    return construirAcervo(supabaseAdmin);
  },
);

/** Busca uma única obra pronta para exibição pública pelo número EXIBIDO. */
export const getObraPublica = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ num: z.number().int().min(1).max(MAX_CHAVE) }).parse(input),
  )
  .handler(async ({ data }): Promise<ObraAcervo | null> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const acervo = await construirAcervo(supabaseAdmin);
    return acervo.find((o) => o.num === data.num) ?? null;
  });

const campoOpcional = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const dadosNovaSchema = z.object({
  posicao: z.number().int().min(1).max(MAX_CHAVE),
  titulo: campoOpcional,
  ano: campoOpcional,
  autor: campoOpcional,
  tecnica: campoOpcional,
  dimensao: campoOpcional,
  parede: campoOpcional,
  descricao: z
    .string()
    .trim()
    .max(20000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

const dadosEdicaoSchema = z.object({
  chave: z.number().int().min(1).max(MAX_CHAVE),
  titulo: campoOpcional,
  ano: campoOpcional,
  autor: campoOpcional,
  tecnica: campoOpcional,
  dimensao: campoOpcional,
  parede: campoOpcional,
  descricao: z
    .string()
    .trim()
    .max(20000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

/**
 * Cria uma nova obra na posição escolhida, empurrando as seguintes (+1).
 * A obra recebe uma identidade interna (chave) automática (>= 1000).
 */
export const criarObra = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dadosNovaSchema.parse(input))
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Garante a ordem materializada para inserir de forma determinística.
    await materializarOrdem(supabaseAdmin);

    const { count } = await supabaseAdmin
      .from("acervo_ordem")
      .select("chave", { count: "exact", head: true });
    const total = count ?? 0;
    const posicao = Math.min(Math.max(1, data.posicao), total + 1);

    // Próxima identidade interna livre.
    const { data: maxRow } = await supabaseAdmin
      .from("obras_extras")
      .select("num")
      .order("num", { ascending: false })
      .limit(1)
      .maybeSingle();
    const chave = Math.max(PRIMEIRA_CHAVE_EXTRA, (maxRow?.num ?? 0) + 1);

    const { error: insErr } = await supabaseAdmin.from("obras_extras").insert({
      num: chave,
      titulo: data.titulo,
      ano: data.ano,
      autor: data.autor,
      tecnica: data.tecnica,
      dimensao: data.dimensao,
      parede: data.parede,
      descricao: data.descricao,
    });

    if (insErr) {
      console.error("criarObra insert:", insErr.message);
      return { ok: false as const, erro: "Não foi possível criar a obra." };
    }

    const { error: ordErr } = await supabaseAdmin.rpc("inserir_na_ordem", {
      p_chave: chave,
      p_posicao: posicao,
    });

    if (ordErr) {
      console.error("criarObra ordem:", ordErr.message);
      // desfaz a inserção da obra para não deixar item fora da ordem
      await supabaseAdmin.from("obras_extras").delete().eq("num", chave);
      return { ok: false as const, erro: "Não foi possível posicionar a obra." };
    }

    return { ok: true as const, chave, posicao };
  });

/** Remove uma obra (pela identidade interna) e fecha o espaço na sequência. */
export const removerObra = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ chave: z.number().int().min(1).max(MAX_CHAVE) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);
    const { chave } = data;
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    await materializarOrdem(supabaseAdmin);

    if (ehObraFixa(chave)) {
      const { error } = await supabaseAdmin
        .from("obras_ocultas")
        .upsert({ num: chave }, { onConflict: "num" });
      if (error) {
        console.error("removerObra ocultar:", error.message);
        return { ok: false as const, erro: "Não foi possível remover a obra." };
      }
    } else {
      const { data: ex } = await supabaseAdmin
        .from("obras_extras")
        .select("imagem_path, audio_url")
        .eq("num", chave)
        .maybeSingle();

      if (ex?.imagem_path) {
        await supabaseAdmin.storage
          .from("imagens-obras")
          .remove([ex.imagem_path]);
      }
      if (ex?.audio_url) {
        await supabaseAdmin.storage.from("audios-obras").remove([ex.audio_url]);
      }

      const { error } = await supabaseAdmin
        .from("obras_extras")
        .delete()
        .eq("num", chave);
      if (error) {
        console.error("removerObra apagar:", error.message);
        return { ok: false as const, erro: "Não foi possível apagar a obra." };
      }
    }

    const { error: ordErr } = await supabaseAdmin.rpc("remover_da_ordem", {
      p_chave: chave,
    });
    if (ordErr) {
      console.error("removerObra ordem:", ordErr.message);
    }

    return { ok: true as const };
  });

/** Salva os campos de dados (título, ano, etc.) e a descrição de uma obra. */
export const salvarDados = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dadosEdicaoSchema.parse(input))
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const tabela = ehObraFixa(data.chave) ? "obra_overrides" : "obras_extras";

    // Lê a parede ATUAL antes de salvar, para detectar troca de parede.
    const { data: atual } = await supabaseAdmin
      .from(tabela)
      .select("parede")
      .eq("num", data.chave)
      .maybeSingle();
    let paredeAntiga = atual?.parede ?? null;
    if (paredeAntiga == null && ehObraFixa(data.chave)) {
      paredeAntiga = getObra(data.chave)?.parede ?? null;
    }

    const { error } = await supabaseAdmin.from(tabela).upsert(
      {
        num: data.chave,
        titulo: data.titulo,
        ano: data.ano,
        autor: data.autor,
        tecnica: data.tecnica,
        dimensao: data.dimensao,
        parede: data.parede,
        descricao: data.descricao,
      },
      { onConflict: "num" },
    );

    if (error) {
      console.error("salvarDados:", error.message);
      return { ok: false as const, erro: "Não foi possível salvar os dados." };
    }

    // Se a parede mudou, move a obra para o INÍCIO do grupo da nova parede.
    if (data.parede && data.parede !== paredeAntiga) {
      try {
        await materializarOrdem(supabaseAdmin);
        const acervo = await construirAcervo(supabaseAdmin);

        // Primeira obra (que não seja a movida) já pertencente à nova parede.
        const alvo = acervo.find(
          (o) => o.chave !== data.chave && o.parede === data.parede,
        );

        // Só reposiciona se já existir outra obra na parede de destino.
        if (alvo) {
          const filtrada = acervo
            .map((o) => o.chave)
            .filter((c) => c !== data.chave);
          const insertAt = filtrada.indexOf(alvo.chave);
          filtrada.splice(insertAt, 0, data.chave);

          const linhas = filtrada.map((c, i) => ({
            chave: c,
            posicao: i + 1,
          }));
          await supabaseAdmin.from("acervo_ordem").delete().gte("chave", 0);
          if (linhas.length > 0) {
            await supabaseAdmin.from("acervo_ordem").insert(linhas);
          }
        }
      } catch (e) {
        console.error("salvarDados reordenar:", e);
        // Não falha o salvamento dos dados por causa da reordenação.
      }
    }

    return { ok: true as const };
  });

/** Recebe uma imagem (base64) e a guarda no storage, registrando o caminho. */
export const salvarImagem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        chave: z.number().int().min(1).max(MAX_CHAVE),
        base64: z.string().min(1).max(15_000_000),
        contentType: z
          .string()
          .regex(/^image\/(jpeg|png|webp)$/, "Formato de imagem inválido."),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    let bytes: Uint8Array;
    try {
      const base = data.base64.includes(",")
        ? data.base64.split(",")[1]
        : data.base64;
      bytes = Uint8Array.from(Buffer.from(base, "base64"));
    } catch {
      return { ok: false as const, erro: "Imagem inválida." };
    }

    const ext =
      data.contentType === "image/png"
        ? "png"
        : data.contentType === "image/webp"
          ? "webp"
          : "jpg";
    const path = `obra-${data.chave}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("imagens-obras")
      .upload(path, bytes, { contentType: data.contentType, upsert: true });

    if (upErr) {
      console.error("salvarImagem upload:", upErr.message);
      return { ok: false as const, erro: "Não foi possível enviar a imagem." };
    }

    const tabela = ehObraFixa(data.chave) ? "obra_overrides" : "obras_extras";
    const { data: salvo, error: dbErr } = await supabaseAdmin
      .from(tabela)
      .upsert({ num: data.chave, imagem_path: path }, { onConflict: "num" })
      .select("updated_at")
      .single();

    if (dbErr) {
      console.error("salvarImagem db:", dbErr.message);
      return { ok: false as const, erro: "Imagem enviada, mas não registrada." };
    }

    return {
      ok: true as const,
      versao: versaoDe(salvo?.updated_at),
    };
  });

/** Salva o texto (descrição) editado de uma obra. */
export const salvarTexto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        chave: z.number().int().min(1).max(MAX_CHAVE),
        descricao: z.string().min(1).max(20000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const tabela = ehObraFixa(data.chave) ? "obra_overrides" : "obras_extras";
    const { error } = await supabaseAdmin
      .from(tabela)
      .upsert(
        { num: data.chave, descricao: data.descricao },
        { onConflict: "num" },
      );

    if (error) {
      console.error("salvarTexto:", error.message);
      return { ok: false as const, erro: "Não foi possível salvar o texto." };
    }
    return { ok: true as const };
  });

/**
 * Obtém a imagem da obra como data URL (base64), para enviar à IA multimodal.
 * Usa a imagem enviada (override no bucket privado) ou a imagem estática.
 */
async function imagemDataUrl(
  chave: number,
  fixa: boolean,
  supabaseAdmin: SupabaseAdmin,
): Promise<string | null> {
  const tabela = fixa ? "obra_overrides" : "obras_extras";
  const { data: row } = await supabaseAdmin
    .from(tabela)
    .select("imagem_path")
    .eq("num", chave)
    .maybeSingle();

  // 1) Imagem enviada pelo admin (bucket privado).
  if (row?.imagem_path) {
    const { data: file, error } = await supabaseAdmin.storage
      .from("imagens-obras")
      .download(row.imagem_path);
    if (!error && file) {
      const ext = row.imagem_path.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime =
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg";
      const buf = Buffer.from(await file.arrayBuffer());
      return `data:${mime};base64,${buf.toString("base64")}`;
    }
  }

  // 2) Imagem estática (URL servida pela plataforma; pode ser relativa).
  const estatica = fixa ? getObra(chave) : undefined;
  const url = estatica?.imagem;
  if (!url) return null;
  try {
    const absoluta = url.startsWith("http")
      ? url
      : new URL(url, new URL(getRequest().url).origin).toString();
    const resp = await fetch(absoluta);
    if (!resp.ok) return null;
    const mime = resp.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await resp.arrayBuffer());
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (e) {
    console.error("imagemDataUrl:", e);
    return null;
  }
}

/**
 * Gera uma audiodescrição unificada a partir da IMAGEM da obra + a descrição
 * existente. NÃO grava no banco: o texto volta para revisão antes de salvar.
 */
export const gerarTextoDescricao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ chave: z.number().int().min(1).max(MAX_CHAVE) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);
    const { chave } = data;
    const fixa = ehObraFixa(chave);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, erro: "IA não configurada." };
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const tabela = fixa ? "obra_overrides" : "obras_extras";
    const { data: existente } = await supabaseAdmin
      .from(tabela)
      .select("descricao, titulo")
      .eq("num", chave)
      .maybeSingle();

    const estatica = fixa ? getObra(chave) : undefined;
    const descricaoAtual =
      existente?.descricao ?? estatica?.descricao ?? "";
    const titulo = existente?.titulo ?? estatica?.titulo ?? "";

    const dataUrl = await imagemDataUrl(chave, fixa, supabaseAdmin);
    if (!dataUrl) {
      return {
        ok: false as const,
        erro: "Esta obra não tem imagem cadastrada para a IA analisar.",
      };
    }

    const system = [
      "Você é especialista em audiodescrição de obras de arte para pessoas com deficiência visual.",
      "Analise a imagem do quadro fornecida e una o que você vê com as informações de catálogo já existentes.",
      "Produza UMA audiodescrição única, fluida e contínua, em português do Brasil.",
      "Descreva objetivamente: composição, figuras, cores, formas, expressões, ambiente, técnica e atmosfera, do geral para o detalhe.",
      "Integre os dados de catálogo (título, autor, ano, técnica, dimensão) de forma natural ao texto.",
      "Tom claro e acolhedor, sem interpretações subjetivas excessivas e sem listar itens com marcadores.",
      "Não use títulos, cabeçalhos, markdown ou rótulos de seção. Devolva apenas o texto corrido da audiodescrição.",
    ].join(" ");

    const userText = [
      titulo ? `Título: ${titulo}.` : "",
      "Informações e descrição já existentes:",
      descricaoAtual || "(sem descrição prévia)",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const resp = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              { role: "system", content: system },
              {
                role: "user",
                content: [
                  { type: "text", text: userText },
                  { type: "image_url", image_url: { url: dataUrl } },
                ],
              },
            ],
          }),
        },
      );

      if (resp.status === 402) {
        return {
          ok: false as const,
          erro: "Créditos de IA esgotados. Adicione créditos ao workspace.",
        };
      }
      if (resp.status === 429) {
        return {
          ok: false as const,
          erro: "Muitas solicitações à IA. Tente novamente em instantes.",
        };
      }
      if (!resp.ok) {
        console.error("gerarTextoDescricao IA:", resp.status, await resp.text());
        return { ok: false as const, erro: "Falha ao gerar o texto com a IA." };
      }

      const json = (await resp.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const texto = json.choices?.[0]?.message?.content?.trim() ?? "";
      if (!texto) {
        return { ok: false as const, erro: "A IA não retornou texto." };
      }
      return { ok: true as const, texto };
    } catch (e) {
      console.error("gerarTextoDescricao:", e);
      return { ok: false as const, erro: "Serviço de IA indisponível." };
    }
  });

/**
 * Divide um texto em pedaços que respeitam o limite da API de voz, preferindo
 * quebras em frases. Usado apenas internamente: o áudio final é único.
 */
function chunkTexto(texto: string, maxChars = 2500): string[] {
  const limpo = texto.trim();
  if (limpo.length <= maxChars) return limpo ? [limpo] : [];
  const frases = limpo.match(/[^.!?]+[.!?]*\s*/g) ?? [limpo];
  const chunks: string[] = [];
  let atual = "";
  const flush = () => {
    if (atual.trim()) chunks.push(atual.trim());
    atual = "";
  };
  for (const frase of frases) {
    if (frase.length > maxChars) {
      flush();
      for (let i = 0; i < frase.length; i += maxChars) {
        chunks.push(frase.slice(i, i + maxChars).trim());
      }
      continue;
    }
    if (atual && atual.length + frase.length > maxChars) flush();
    atual += frase;
  }
  flush();
  return chunks;
}

/**
 * Gera a locução de uma obra como UM ÚNICO arquivo de áudio (uma voz, do
 * começo ao fim). Para respeitar o limite da API, o texto é dividido em
 * pedaços apenas por tamanho e os áudios são concatenados num só arquivo.
 */
export const regenerarAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        chave: z.number().int().min(1).max(MAX_CHAVE),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);
    const { chave } = data;
    const fixa = ehObraFixa(chave);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return { ok: false as const, erro: "Chave de voz não configurada." };
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const tabela = fixa ? "obra_overrides" : "obras_extras";

    // Texto: usa o registro salvo se existir, senão o texto estático (fixas).
    const { data: existente } = await supabaseAdmin
      .from(tabela)
      .select("descricao")
      .eq("num", chave)
      .maybeSingle();

    const estatica = fixa ? getObra(chave) : undefined;
    const texto = existente?.descricao ?? estatica?.descricao ?? "";

    if (!texto.trim()) {
      return { ok: false as const, erro: "Esta obra não tem texto." };
    }

    const pedacos = chunkTexto(texto);
    if (pedacos.length === 0) {
      return { ok: false as const, erro: "Esta obra não tem texto." };
    }

    // Gera o áudio de um pedaço (com contexto dos vizinhos) e retorna o buffer.
    async function gerarVoz(
      texto: string,
      prev: string | null,
      next: string | null,
    ): Promise<ArrayBuffer> {
      const resp = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOZ_FEMININA_ID}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: texto,
            model_id: "eleven_multilingual_v2",
            ...(prev ? { previous_text: prev.slice(-400) } : {}),
            ...(next ? { next_text: next.slice(0, 400) } : {}),
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.75,
              style: 0.2,
              use_speaker_boost: true,
              speed: 0.95,
            },
          }),
        },
      );
      if (!resp.ok) {
        const err = await resp.text();
        console.error("ElevenLabs:", resp.status, err);
        throw new Error(`Falha ao gerar áudio (${resp.status}).`);
      }
      return resp.arrayBuffer();
    }

    let path: string;
    try {
      // Gera os pedaços em ordem e concatena num único buffer MP3.
      const buffers = await Promise.all(
        pedacos.map((p, i) =>
          gerarVoz(
            p,
            i > 0 ? pedacos[i - 1] : null,
            i < pedacos.length - 1 ? pedacos[i + 1] : null,
          ),
        ),
      );
      const total = buffers.reduce((n, b) => n + b.byteLength, 0);
      const unico = new Uint8Array(total);
      let off = 0;
      for (const b of buffers) {
        unico.set(new Uint8Array(b), off);
        off += b.byteLength;
      }

      path = `obra-${chave}-fem-${Date.now()}.mp3`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("audios-obras")
        .upload(path, unico, {
          contentType: "audio/mpeg",
          upsert: true,
        });
      if (upErr) {
        console.error("upload:", upErr.message);
        throw new Error("Não foi possível salvar o áudio.");
      }
    } catch (e) {
      console.error("regenerarAudio:", e);
      const erro =
        e instanceof Error ? e.message : "Serviço de voz indisponível.";
      return { ok: false as const, erro };
    }

    // Grava o caminho do áudio único. Limpa trechos e a voz masculina legados.
    const { data: salvo, error: dbErr } = await supabaseAdmin
      .from(tabela)
      .upsert(
        {
          num: chave,
          audio_fem_path: path,
          audio_trechos: null,
          audio_url: null,
          audio_masc_path: null,
        },
        { onConflict: "num" },
      )
      .select("updated_at")
      .single();

    if (dbErr) {
      console.error("regenerarAudio db:", dbErr.message);
      return { ok: false as const, erro: "Áudio gerado, mas não registrado." };
    }

    return {
      ok: true as const,
      versao: versaoDe(salvo?.updated_at),
    };
  });

/** Retorna a URL de prévia (amostra) de uma voz da ElevenLabs. */
export const amostraVoz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ vozId: z.string().min(1).max(100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);
    if (!vozValida(data.vozId)) {
      return { ok: false as const, erro: "Voz inválida." };
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return { ok: false as const, erro: "Chave de voz não configurada." };
    }

    try {
      const resp = await fetch(
        `https://api.elevenlabs.io/v1/voices/${data.vozId}`,
        { headers: { "xi-api-key": apiKey } },
      );

      if (!resp.ok) {
        console.error("amostraVoz:", resp.status, await resp.text());
        return { ok: false as const, erro: "Não foi possível obter a amostra." };
      }

      const voz = (await resp.json()) as { preview_url?: string };
      if (!voz.preview_url) {
        return { ok: false as const, erro: "Esta voz não tem amostra." };
      }

      return { ok: true as const, url: voz.preview_url };
    } catch (e) {
      console.error("amostraVoz fetch:", e);
      return { ok: false as const, erro: "Serviço de voz indisponível." };
    }
  });
