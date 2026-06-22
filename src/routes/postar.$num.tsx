import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Video } from "lucide-react";
import {
  listarAcervo,
  contarPostagensReels,
} from "@/lib/admin-obras.functions";
import { GeradorReels } from "@/components/GeradorReels";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export const Route = createFileRoute("/postar/$num")({
  loader: async ({ params }) => {
    const num = Number(params.num);
    if (!Number.isInteger(num) || num < 1) throw notFound();

    const acervo = await listarAcervo();
    const obra = acervo.find((o) => o.num === num);
    if (!obra) throw notFound();

    return { obra };
  },

  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.obra
          ? `Postar — ${loaderData.obra.titulo}`
          : "Postar obra",
      },
    ],
  }),

  component: PostarPagina,
  notFoundComponent: PostarNaoEncontrada,
});

function PostarPagina() {
  const { obra } = Route.useLoaderData();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/obras/$num"
        params={{ num: String(obra.num) }}
        className="text-sm font-medium text-accent hover:underline"
      >
        ← Voltar à obra
      </Link>

      <header className="mt-4">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Gerar reels · Obra {obra.num}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-foreground sm:text-4xl">
          {obra.titulo}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Monta um vídeo vertical (9:16) com a imagem da obra e a locução, para
          baixar e postar nas redes sociais.
        </p>
      </header>

      <div className="mt-6">
        <GeradorReels obra={obra} />
      </div>
    </article>
  );
}

function PostarNaoEncontrada() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Obra não encontrada
      </h1>
      <p className="mt-2 text-muted-foreground">
        Não localizamos esta obra no catálogo.
      </p>
      <Link
        to="/obras"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Ir para o acervo
      </Link>
    </div>
  );
}
