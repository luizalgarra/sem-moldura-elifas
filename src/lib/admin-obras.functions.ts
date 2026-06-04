import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getObra, ehObraFixa, type Obra } from "@/data/obras";

const VOZ_PADRAO = "EXAVITQu4vr4xnSDxMaL"; // Sarah (suave)
const OBRA_PROTEGIDA = 2; // áudio especial com duas vozes unidas
const MAX_OBRA = 116; // maior número do catálogo fixo
const MAX_NUM = 9999; // limite para obras novas (extras)

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
  vozId: string;
  updatedAt: string | null;
}

/** Obra já mesclada (fixa + edições, ou extra) pronta para exibição. */
export interface ObraAcervo extends Obra {
  extra: boolean;
}

function versaoDe(updatedAt: string | null | undefined): string {
  return updatedAt
    ? new Date(updatedAt).getTime().toString()
    : Date.now().toString();
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

/**
 * Monta o acervo final: obras fixas (sem as ocultas, com edições aplicadas)
 * mais as obras extras criadas no painel. Usado nas páginas públicas e na
 * página de edição.
 */
export const listarAcervo = createServerFn({ method: "GET" }).handler(
  async (): Promise<ObraAcervo[]> => {
    const { obras } = await import("@/data/obras");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const [ocultasRes, overridesRes, extrasRes] = await Promise.all([
      supabaseAdmin.from("obras_ocultas").select("num"),
      supabaseAdmin
        .from("obra_overrides")
        .select(
          "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, updated_at",
        ),
      supabaseAdmin
        .from("obras_extras")
        .select(
          "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, updated_at",
        ),
    ]);

    const ocultas = new Set((ocultasRes.data ?? []).map((r) => r.num));
    const overrides = new Map(
      (overridesRes.data ?? []).map((r) => [r.num, r]),
    );

    const lista: ObraAcervo[] = [];

    for (const obra of obras) {
      if (ocultas.has(obra.num)) continue;
      const ov = overrides.get(obra.num);
      lista.push({
        num: obra.num,
        titulo: ov?.titulo ?? obra.titulo,
        ano: ov?.ano ?? obra.ano,
        autor: ov?.autor ?? obra.autor,
        tecnica: ov?.tecnica ?? obra.tecnica,
        dimensao: ov?.dimensao ?? obra.dimensao,
        parede: ov?.parede ?? obra.parede,
        descricao: ov?.descricao ?? obra.descricao,
        imagem: ov?.imagem_path
          ? `/api/public/obra-imagem/${obra.num}?v=${versaoDe(ov.updated_at)}`
          : obra.imagem,
        audio: ov?.audio_url
          ? `/api/public/obra-audio/${obra.num}?v=${versaoDe(ov.updated_at)}`
          : obra.audio,
        extra: false,
      });
    }

    for (const ex of extrasRes.data ?? []) {
      lista.push({
        num: ex.num,
        titulo: ex.titulo ?? `Obra ${ex.num}`,
        ano: ex.ano ?? "",
        autor: ex.autor ?? "Elifas Andreato",
        tecnica: ex.tecnica ?? "",
        dimensao: ex.dimensao ?? "",
        parede: ex.parede ?? "Obras adicionais",
        descricao: ex.descricao ?? "",
        imagem: ex.imagem_path
          ? `/api/public/obra-imagem/${ex.num}?v=${versaoDe(ex.updated_at)}`
          : null,
        audio: ex.audio_url
          ? `/api/public/obra-audio/${ex.num}?v=${versaoDe(ex.updated_at)}`
          : null,
        extra: true,
      });
    }

    lista.sort((a, b) => a.num - b.num);
    return lista;
  },
);

/** Busca uma única obra pronta para exibição pública (ou null). */
export const getObraPublica = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ num: z.number().int().min(1).max(MAX_NUM) }).parse(input),
  )
  .handler(async ({ data }): Promise<ObraAcervo | null> => {
    const { num } = data;
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    if (ehObraFixa(num)) {
      const { data: oculta } = await supabaseAdmin
        .from("obras_ocultas")
        .select("num")
        .eq("num", num)
        .maybeSingle();
      if (oculta) return null;

      const obra = getObra(num)!;
      const { data: ov } = await supabaseAdmin
        .from("obra_overrides")
        .select(
          "titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, updated_at",
        )
        .eq("num", num)
        .maybeSingle();

      return {
        num,
        titulo: ov?.titulo ?? obra.titulo,
        ano: ov?.ano ?? obra.ano,
        autor: ov?.autor ?? obra.autor,
        tecnica: ov?.tecnica ?? obra.tecnica,
        dimensao: ov?.dimensao ?? obra.dimensao,
        parede: ov?.parede ?? obra.parede,
        descricao: ov?.descricao ?? obra.descricao,
        imagem: ov?.imagem_path
          ? `/api/public/obra-imagem/${num}?v=${versaoDe(ov.updated_at)}`
          : obra.imagem,
        audio: ov?.audio_url
          ? `/api/public/obra-audio/${num}?v=${versaoDe(ov.updated_at)}`
          : obra.audio,
        extra: false,
      };
    }

    const { data: ex } = await supabaseAdmin
      .from("obras_extras")
      .select(
        "num, titulo, ano, autor, tecnica, dimensao, parede, descricao, imagem_path, audio_url, updated_at",
      )
      .eq("num", num)
      .maybeSingle();

    if (!ex) return null;

    return {
      num: ex.num,
      titulo: ex.titulo ?? `Obra ${ex.num}`,
      ano: ex.ano ?? "",
      autor: ex.autor ?? "Elifas Andreato",
      tecnica: ex.tecnica ?? "",
      dimensao: ex.dimensao ?? "",
      parede: ex.parede ?? "Obras adicionais",
      descricao: ex.descricao ?? "",
      imagem: ex.imagem_path
        ? `/api/public/obra-imagem/${ex.num}?v=${versaoDe(ex.updated_at)}`
        : null,
      audio: ex.audio_url
        ? `/api/public/obra-audio/${ex.num}?v=${versaoDe(ex.updated_at)}`
        : null,
      extra: true,
    };
  });

const campoOpcional = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const dadosSchema = z.object({
  num: z.number().int().min(1).max(MAX_NUM),
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

/** Cria uma nova obra (extra) com o número escolhido pelo administrador. */
export const criarObra = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => dadosSchema.parse(input))
  .handler(async ({ data }) => {
    if (ehObraFixa(data.num)) {
      return {
        ok: false as const,
        erro: `O número ${data.num} já pertence a uma obra do catálogo.`,
      };
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: existente } = await supabaseAdmin
      .from("obras_extras")
      .select("num")
      .eq("num", data.num)
      .maybeSingle();

    if (existente) {
      return {
        ok: false as const,
        erro: `Já existe uma obra com o número ${data.num}.`,
      };
    }

    const { error } = await supabaseAdmin.from("obras_extras").insert({
      num: data.num,
      titulo: data.titulo,
      ano: data.ano,
      autor: data.autor,
      tecnica: data.tecnica,
      dimensao: data.dimensao,
      parede: data.parede,
      descricao: data.descricao,
    });

    if (error) {
      console.error("criarObra:", error.message);
      return { ok: false as const, erro: "Não foi possível criar a obra." };
    }
    return { ok: true as const };
  });

/** Remove uma obra: oculta se for fixa, apaga de vez se for extra. */
export const removerObra = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ num: z.number().int().min(1).max(MAX_NUM) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { num } = data;
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    if (ehObraFixa(num)) {
      const { error } = await supabaseAdmin
        .from("obras_ocultas")
        .upsert({ num }, { onConflict: "num" });
      if (error) {
        console.error("removerObra ocultar:", error.message);
        return { ok: false as const, erro: "Não foi possível remover a obra." };
      }
      return { ok: true as const };
    }

    // Obra extra: apaga registro e arquivos do storage.
    const { data: ex } = await supabaseAdmin
      .from("obras_extras")
      .select("imagem_path, audio_url")
      .eq("num", num)
      .maybeSingle();

    if (ex?.imagem_path) {
      await supabaseAdmin.storage.from("imagens-obras").remove([ex.imagem_path]);
    }
    if (ex?.audio_url) {
      await supabaseAdmin.storage.from("audios-obras").remove([ex.audio_url]);
    }

    const { error } = await supabaseAdmin
      .from("obras_extras")
      .delete()
      .eq("num", num);

    if (error) {
      console.error("removerObra apagar:", error.message);
      return { ok: false as const, erro: "Não foi possível apagar a obra." };
    }
    return { ok: true as const };
  });

/** Salva os campos de dados (título, ano, etc.) e a descrição de uma obra. */
export const salvarDados = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => dadosSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const tabela = ehObraFixa(data.num) ? "obra_overrides" : "obras_extras";
    const { error } = await supabaseAdmin.from(tabela).upsert(
      {
        num: data.num,
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
    return { ok: true as const };
  });

/** Recebe uma imagem (base64) e a guarda no storage, registrando o caminho. */
export const salvarImagem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        num: z.number().int().min(1).max(MAX_NUM),
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
    const path = `obra-${data.num}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("imagens-obras")
      .upload(path, bytes, { contentType: data.contentType, upsert: true });

    if (upErr) {
      console.error("salvarImagem upload:", upErr.message);
      return { ok: false as const, erro: "Não foi possível enviar a imagem." };
    }

    const tabela = ehObraFixa(data.num) ? "obra_overrides" : "obras_extras";
    const { data: salvo, error: dbErr } = await supabaseAdmin
      .from(tabela)
      .upsert({ num: data.num, imagem_path: path }, { onConflict: "num" })
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
        num: z.number().int().min(1).max(MAX_NUM),
        descricao: z.string().min(1).max(20000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const tabela = ehObraFixa(data.num) ? "obra_overrides" : "obras_extras";
    const { error } = await supabaseAdmin
      .from(tabela)
      .upsert(
        { num: data.num, descricao: data.descricao },
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
    z.object({ num: z.number().int().min(1).max(MAX_NUM) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { num } = data;
    const fixa = ehObraFixa(num);

    if (num === OBRA_PROTEGIDA) {
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
      .eq("num", num)
      .maybeSingle();

    const estatica = fixa ? getObra(num) : undefined;
    const texto = existente?.descricao ?? estatica?.descricao ?? "";
    const vozId = existente?.voz_id ?? VOZ_PADRAO;

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
    const path = `obra-${num}-${Date.now()}.mp3`;
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
      .upsert({ num, audio_url: path, voz_id: vozId }, { onConflict: "num" })
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
