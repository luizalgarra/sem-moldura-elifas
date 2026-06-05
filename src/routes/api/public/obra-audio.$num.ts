import { createFileRoute } from "@tanstack/react-router";
import { ehObraFixa } from "@/data/obras";

export const Route = createFileRoute("/api/public/obra-audio/$num")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const num = Number(params.num);
        if (!Number.isInteger(num) || num < 1 || num > 999999) {
          return new Response("Not found", { status: 404 });
        }

        const voz = new URL(request.url).searchParams.get("voz");

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const tabela = ehObraFixa(num) ? "obra_overrides" : "obras_extras";
        const { data: row, error } = await supabaseAdmin
          .from(tabela)
          .select("audio_url, audio_fem_path, audio_masc_path")
          .eq("num", num)
          .maybeSingle();

        if (error || !row) {
          return new Response("Not found", { status: 404 });
        }

        // Escolhe o arquivo conforme a voz pedida, com fallback ao legado.
        const caminho =
          voz === "masc"
            ? (row.audio_masc_path ?? row.audio_url)
            : (row.audio_fem_path ?? row.audio_url);

        if (!caminho) {
          return new Response("Not found", { status: 404 });
        }

        const { data: file, error: dlErr } = await supabaseAdmin.storage
          .from("audios-obras")
          .download(caminho);

        if (dlErr || !file) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(file, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
