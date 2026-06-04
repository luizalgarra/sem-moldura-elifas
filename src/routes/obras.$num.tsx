import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ImageOff, ZoomIn, X } from "lucide-react";
import { obras } from "@/data/obras";
import { listarAcervo } from "@/lib/admin-obras.functions";
import { AudioDescricao } from "@/components/AudioDescricao";
import { NavegacaoSequencial } from "@/components/NavegacaoSequencial";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/obras/$num")({
  loader: async ({ params }) => {
    const num = Number(params.num);
    if (!Number.isInteger(num) || num < 1) throw notFound();

    const acervo = await listarAcervo();
    const obra = acervo.find((o) => o.num === num);
    if (!obra) throw notFound();

    return { obra, total: acervo.length };
  },


  head: ({ loaderData }) => ({
    meta: loaderData?.obra
      ? [
          { title: `${loaderData.obra.titulo} — Elifas Andreato: Sem Moldura` },
          {
            name: "description",
            content: `${loaderData.obra.titulo} (${loaderData.obra.ano}), de Elifas Andreato. ${loaderData.obra.tecnica}.`,
          },
          { property: "og:title", content: `${loaderData.obra.titulo} — Elifas Andreato` },
          ...(loaderData.obra.imagem
            ? [{ property: "og:image", content: loaderData.obra.imagem }]
            : []),
        ]
      : [],
  }),

  component: ObraPagina,
  errorComponent: ObraErro,
  notFoundComponent: ObraNaoEncontrada,
});

function ObraPagina() {
  const { obra, total } = Route.useLoaderData();
  const [ampliada, setAmpliada] = useState(false);


  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/obras" className="text-sm font-medium text-primary hover:underline">
        ← Voltar ao acervo
      </Link>

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-square bg-muted sm:aspect-[4/3]">
          {obra.imagem ? (
            <>
              <img
                src={obra.imagem}
                alt={`Obra ${obra.num}: ${obra.titulo}, de Elifas Andreato, ${obra.ano}. Técnica: ${obra.tecnica}.`}
                className="size-full object-contain"
              />
              <button
                type="button"
                onClick={() => setAmpliada(true)}
                className="absolute bottom-3 right-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
                aria-label="Ampliar imagem da obra"
              >
                <ZoomIn aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-10" aria-hidden="true" />
              <span className="text-sm">Imagem desta obra em breve</span>
            </div>
          )}
        </div>
      </div>

      <header className="mt-6">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Obra {obra.num} · {obra.parede}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-foreground sm:text-4xl">
          {obra.titulo}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">{obra.ano}</p>
      </header>

      <div className="mt-6">
        <AudioDescricao texto={obra.descricao} audio={obra.audio} />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        <FichaItem rotulo="Autor" valor={obra.autor} />
        <FichaItem rotulo="Ano" valor={obra.ano} />
        <FichaItem rotulo="Técnica" valor={obra.tecnica} />
        <FichaItem rotulo="Dimensão do original" valor={obra.dimensao} />
      </dl>

      <section className="mt-6" aria-labelledby="descricao-titulo">
        <h2 id="descricao-titulo" className="font-serif text-xl font-semibold text-foreground">
          Descrição
        </h2>
        <p className="mt-2 leading-relaxed text-foreground">{obra.descricao}</p>
      </section>

      <div className="mt-10 border-t border-border pt-6">
        <NavegacaoSequencial num={obra.num} />
      </div>

      {ampliada && obra.imagem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagem ampliada: ${obra.titulo}`}
          onClick={() => setAmpliada(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-background text-foreground"
            aria-label="Fechar imagem ampliada"
            onClick={() => setAmpliada(false)}
          >
            <X aria-hidden="true" />
          </button>
          <img
            src={obra.imagem}
            alt={`Obra ${obra.num}: ${obra.titulo}, ampliada.`}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}

function FichaItem({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="bg-card p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {rotulo}
      </dt>
      <dd className="mt-1 text-foreground">{valor}</dd>
    </div>
  );
}

function ObraNaoEncontrada() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-serif text-2xl font-bold text-foreground">Obra não encontrada</h1>
      <p className="mt-2 text-muted-foreground">
        Não localizamos esta obra no catálogo. Há {obras.length} obras disponíveis.
      </p>
      <Button asChild className="mt-6 min-h-11">
        <Link to="/obras">Ir para o acervo</Link>
      </Button>
    </div>
  );
}

function ObraErro({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-serif text-2xl font-bold text-foreground">Erro ao abrir a obra</h1>
      <p className="mt-2 text-muted-foreground">Tente novamente.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset} className="min-h-11">
          Tentar de novo
        </Button>
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/obras">Acervo</Link>
        </Button>
      </div>
    </div>
  );
}
