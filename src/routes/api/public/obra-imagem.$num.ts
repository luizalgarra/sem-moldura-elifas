import { createFileRoute } from "@tanstack/react-router";

const TIPOS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const Route = createFileRoute("/api/public/obra-imagem/$num")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const num = Number(params.num);
        if (!Number.isInteger(num) || num < 1 || num > 116) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const { data: row, error } = await supabaseAdmin
          .from("obra_overrides")
          .select("imagem_path")
          .eq("num", num)
          .maybeSingle();

        if (error || !row?.imagem_path) {
          return new Response("Not found", { status: 404 });
        }

        const { data: file, error: dlErr } = await supabaseAdmin.storage
          .from("imagens-obras")
          .download(row.imagem_path);

        if (dlErr || !file) {
          return new Response("Not found", { status: 404 });
        }

        const ext = row.imagem_path.split(".").pop()?.toLowerCase() ?? "jpg";
        const contentType = TIPOS[ext] ?? "image/jpeg";

        return new Response(file, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
