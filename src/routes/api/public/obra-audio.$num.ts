import { createFileRoute } from "@tanstack/react-router";
import { ehObraFixa } from "@/data/obras";

export const Route = createFileRoute("/api/public/obra-audio/$num")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const num = Number(params.num);
        if (!Number.isInteger(num) || num < 1 || num > 999999) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const tabela = ehObraFixa(num) ? "obra_overrides" : "obras_extras";
        const { data: row, error } = await supabaseAdmin
          .from(tabela)
          .select("audio_url")
          .eq("num", num)
          .maybeSingle();

        if (error || !row?.audio_url) {
          return new Response("Not found", { status: 404 });
        }

        const { data: file, error: dlErr } = await supabaseAdmin.storage
          .from("audios-obras")
          .download(row.audio_url);

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
