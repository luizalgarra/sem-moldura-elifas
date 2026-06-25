import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Route as RouteIcon, Search } from "lucide-react";
import { paredesOrdem } from "@/data/obras";
import { listarAcervo, type ObraAcervo } from "@/lib/admin-obras.functions";
import { ObraCard } from "@/components/ObraCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/obras/")({
  head: () => ({
    meta: [
      { title: "Acervo — Elifas Andreato: Além da Moldura" },
      {
        name: "description",
        content:
          "Navegue pelas obras da exposição Elifas Andreato: Além da Moldura, organizadas por parede.",
      },
    ],
  }),
  loader: () => listarAcervo(),
  component: Acervo,
});

function agruparPorParede(
  lista: ObraAcervo[],
): { parede: string; obras: ObraAcervo[] }[] {
  const grupos = new Map<string, ObraAcervo[]>();
  for (const obra of lista) {
    const arr = grupos.get(obra.parede) ?? [];
    arr.push(obra);
    grupos.set(obra.parede, arr);
  }
  // Ordena: primeiro as paredes conhecidas, depois quaisquer outras (A→Z).
  const conhecidas = paredesOrdem.filter((p) => grupos.has(p));
  const extras = [...grupos.keys()]
    .filter((p) => !paredesOrdem.includes(p))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  return [...conhecidas, ...extras].map((parede) => ({
    parede,
    obras: grupos.get(parede)!,
  }));
}

function Acervo() {
  const lista = Route.useLoaderData();
  const [busca, setBusca] = useState("");
  const grupos = useMemo(() => agruparPorParede(lista), [lista]);
  const termo = busca.trim().toLowerCase();

  const gruposFiltrados = useMemo(() => {
    if (!termo) return grupos;
    return grupos
      .map((g) => ({
        ...g,
        obras: g.obras.filter(
          (o) =>
            o.titulo.toLowerCase().includes(termo) ||
            o.ano.toLowerCase().includes(termo) ||
            String(o.num) === termo,
        ),
      }))
      .filter((g) => g.obras.length > 0);
  }, [grupos, termo]);

  const total = gruposFiltrados.reduce((s, g) => s + g.obras.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        to="/linhas-da-vida"
        className="group mb-8 flex items-center gap-4 rounded-lg border border-accent bg-card p-5 transition-colors hover:bg-accent/10"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <RouteIcon className="size-6" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block font-serif text-lg font-semibold text-accent">
            Linha do Tempo
          </span>
          <span className="block text-sm text-muted-foreground">
            Percorra a trajetória de Elifas Andreato e as histórias por trás das obras.
          </span>
        </span>
        <ArrowRight
          className="size-5 shrink-0 text-accent transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Acervo da exposição
        </h1>
        <p className="mt-2 text-muted-foreground">
          {lista.length} obras organizadas pelas paredes da exposição.
        </p>
        <div className="relative mt-5 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, ano ou número"
            aria-label="Buscar obras por título, ano ou número"
            className="h-12 pl-10 text-base"
          />
        </div>
        {termo && (
          <p className="mt-3 text-sm text-muted-foreground" role="status">
            {total} {total === 1 ? "obra encontrada" : "obras encontradas"}.
          </p>
        )}
      </header>

      {gruposFiltrados.length === 0 ? (

        <p className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          Nenhuma obra encontrada para “{busca}”.
        </p>
      ) : (
        <div className="space-y-12">
          {gruposFiltrados.map((grupo) => (
            <section key={grupo.parede} aria-labelledby={`parede-${grupo.parede}`}>
              <h2
                id={`parede-${grupo.parede}`}
                className="mb-4 scroll-mt-24 border-b border-border pb-2 font-serif text-2xl font-semibold text-foreground"
              >
                {grupo.parede}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({grupo.obras.length})
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {grupo.obras.map((obra) => (
                  <ObraCard key={obra.num} obra={obra} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
