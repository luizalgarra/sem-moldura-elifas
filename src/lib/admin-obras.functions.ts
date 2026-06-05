import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getObra, ehObraFixa, obras, type Obra } from "@/data/obras";
import { VOZ_FEMININA_ID, VOZ_MASCULINA_ID, vozValida } from "@/data/vozes";

const OBRA_PROTEGIDA = 2; // áudio especial com duas vozes unidas (chave fixa)
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
  vozId: string;
  updatedAt: string | null;
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
}

function versaoDe(updatedAt: string | null | undefined): string {
  return updatedAt
    ? new Date(updatedAt).getTime().toString()
    : Date.now().toString();
}

type SupabaseAdmin = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

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
        "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, audio_fem_path, audio_masc_path, updated_at",
      ),
    supabaseAdmin
      .from("obras_extras")
      .select(
        "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, audio_fem_path, audio_masc_path, updated_at",
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
        "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, voz_id, updated_at",
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
  .inputValidator((input: unknown) => dadosNovaSchema.parse(input))
  .handler(async ({ data }) => {
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
  .inputValidator((input: unknown) =>
    z.object({ chave: z.number().int().min(1).max(MAX_CHAVE) }).parse(input),
  )
  .handler(async ({ data }) => {
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
  .inputValidator((input: unknown) => dadosEdicaoSchema.parse(input))
  .handler(async ({ data }) => {
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
  .handler(async ({ data }) => {
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
  .inputValidator((input: unknown) =>
    z
      .object({
        chave: z.number().int().min(1).max(MAX_CHAVE),
        descricao: z.string().min(1).max(20000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
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

/** Regenera o áudio de uma obra via ElevenLabs e salva no storage. */
export const regenerarAudio = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        chave: z.number().int().min(1).max(MAX_CHAVE),
        vozId: z.string().min(1).max(100).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { chave } = data;
    const fixa = ehObraFixa(chave);
    const vozEscolhida = vozValida(data.vozId) ? data.vozId! : null;

    if (chave === OBRA_PROTEGIDA) {
      return {
        ok: false as const,
        erro: "Esta obra tem áudio especial e não pode ser regenerada aqui.",
      };
    }

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
      .select("descricao, voz_id")
      .eq("num", chave)
      .maybeSingle();

    const estatica = fixa ? getObra(chave) : undefined;
    const texto = existente?.descricao ?? estatica?.descricao ?? "";
    const vozId = vozEscolhida ?? existente?.voz_id ?? VOZ_PADRAO;

    if (!texto.trim()) {
      return { ok: false as const, erro: "Esta obra não tem texto." };
    }

    // Gera o áudio.
    let audioBuffer: ArrayBuffer;
    try {
      const resp = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${vozId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: texto,
            model_id: "eleven_multilingual_v2",
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
        return {
          ok: false as const,
          erro: `Falha ao gerar áudio (${resp.status}).`,
        };
      }
      audioBuffer = await resp.arrayBuffer();
    } catch (e) {
      console.error("regenerarAudio fetch:", e);
      return { ok: false as const, erro: "Serviço de voz indisponível." };
    }

    // Faz upload no storage (bucket privado).
    const path = `obra-${chave}-${Date.now()}.mp3`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("audios-obras")
      .upload(path, new Uint8Array(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (upErr) {
      console.error("upload:", upErr.message);
      return { ok: false as const, erro: "Não foi possível salvar o áudio." };
    }

    // Grava a referência no banco.
    const { data: salvo, error: dbErr } = await supabaseAdmin
      .from(tabela)
      .upsert({ num: chave, audio_url: path, voz_id: vozId }, { onConflict: "num" })
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
  .inputValidator((input: unknown) =>
    z.object({ vozId: z.string().min(1).max(100) }).parse(input),
  )
  .handler(async ({ data }) => {
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
