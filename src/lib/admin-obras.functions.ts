import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getObra } from "@/data/obras";

const VOZ_PADRAO = "EXAVITQu4vr4xnSDxMaL"; // Sarah (suave)
const OBRA_PROTEGIDA = 2; // áudio especial com duas vozes unidas

export interface OverrideObra {
  num: number;
  descricao: string | null;
  audioPath: string | null;
  vozId: string;
  updatedAt: string | null;
}

/** Lista todos os overrides salvos no banco. */
export const listarOverrides = createServerFn({ method: "GET" }).handler(
  async (): Promise<OverrideObra[]> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("obra_overrides")
      .select("num, descricao, audio_url, voz_id, updated_at")
      .order("num", { ascending: true });

    if (error) {
      console.error("listarOverrides:", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      num: row.num,
      descricao: row.descricao,
      audioPath: row.audio_url,
      vozId: row.voz_id,
      updatedAt: row.updated_at,
    }));
  },
);

/** Busca o override de uma única obra (usado na página pública). */
export const getOverridePublico = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ num: z.number().int().min(1).max(85) }).parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{ descricao: string | null; audioVersao: string | null }> => {
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );
      const { data: row, error } = await supabaseAdmin
        .from("obra_overrides")
        .select("descricao, audio_url, updated_at")
        .eq("num", data.num)
        .maybeSingle();

      if (error || !row) {
        return { descricao: null, audioVersao: null };
      }
      return {
        descricao: row.descricao,
        audioVersao: row.audio_url
          ? new Date(row.updated_at).getTime().toString()
          : null,
      };
    },
  );

/** Salva o texto (descrição) editado de uma obra. */
export const salvarTexto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        num: z.number().int().min(1).max(85),
        descricao: z.string().min(1).max(20000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("obra_overrides")
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
    z.object({ num: z.number().int().min(1).max(85) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { num } = data;

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

    // Texto: usa override salvo se existir, senão o texto estático.
    const { data: existente } = await supabaseAdmin
      .from("obra_overrides")
      .select("descricao, voz_id")
      .eq("num", num)
      .maybeSingle();

    const estatica = getObra(num);
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
      .from("obra_overrides")
      .upsert(
        { num, audio_url: path, voz_id: vozId },
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
      versao: salvo?.updated_at ?? String(Date.now()),
    };
  });
