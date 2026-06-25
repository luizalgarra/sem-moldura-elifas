import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Route as RouteIcon } from "lucide-react";
import { obras } from "@/data/obras";
import { Button } from "@/components/ui/button";
import { marca } from "@/assets/marca";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elifas Andreato — Além da Moldura · Catálogo Virtual" },
      {
        name: "description",
        content:
          "Catálogo virtual da exposição 80 anos de Elifas Andreato: Além da Moldura. Obras com áudio-descrição e acesso por QR Code.",
      },
    ],
  }),
  component: Index,
});

// Página temporária "Em construção" (mantida para reuso futuro).
// Para reativá-la, troque `component: Index` por `component: EmConstrucao`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EmConstrucao() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-background px-4 py-20">
      <img
        src={marca.heroElifasArte}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-30"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background"
        aria-hidden="true"
      />
      <div className="relative flex max-w-xl flex-col items-center text-center">
        <img
          src={marca.logoFirmaBranco}
          alt="Elifas Andreato — Além da Moldura"
          className="h-16 w-auto sm:h-20"
          width={220}
          height={80}
        />
        <p className="mt-8 font-semibold uppercase tracking-[0.3em] text-brand-yellow">
          80 anos
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          Em breve
        </h1>
        <p className="mt-6 text-lg text-foreground/80">
          Estamos preparando o catálogo virtual da exposição. Volte em breve.
        </p>
      </div>
    </section>
  );
}

function Index() {
  const destaques = obras.filter((o) => o.imagem).slice(0, 6);

  return (
    <div className="space-y-12 pb-12 sm:pb-16 sm:space-y-16">
      {/* Hero com imagem de fundo */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden">
        <img
          src={marca.heroElifasArte}
          alt="Retrato de Elifas Andreato sobre uma de suas pinturas a óleo."
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl space-y-8">
            <div className="flex flex-wrap gap-3">
              <span className="border border-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                Catálogo virtual
              </span>
              <span className="border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Exposição acessível
              </span>
            </div>

            <div className="space-y-5">
              <p className="font-semibold uppercase tracking-[0.3em] text-brand-yellow">
                Exposição · 80 anos
              </p>
              <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
                Elifas Andreato
                <span className="block text-accent">Além da Moldura</span>
              </h1>
              <p className="max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
                Um catálogo virtual para percorrer as{" "}
                <span className="font-semibold text-foreground">{obras.length} obras</span>{" "}
                da exposição, com áudio-descrição.
              </p>
            </div>

            <Button asChild size="lg" className="min-h-12 px-8 text-base uppercase tracking-widest">
              <Link to="/obras">
                Explorar obras
                <ArrowRight className="ml-2 size-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 sm:space-y-16">
      {/* Banner Linha do Tempo */}
      <section>
        <Link
          to="/linhas-da-vida"
          className="group flex flex-col gap-6 rounded-lg border border-border bg-card p-8 transition-colors hover:border-accent sm:flex-row sm:items-center sm:justify-between sm:p-12"
        >
          <div className="flex items-center gap-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <RouteIcon className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Linha do Tempo
              </h2>
              <p className="text-base font-light text-muted-foreground">
                Percorra a trajetória de Elifas Andreato e as histórias por trás das obras.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-accent">
            Ver cronologia
            <span className="h-[2px] w-12 bg-accent transition-all group-hover:w-16" aria-hidden="true" />
          </div>
        </Link>
      </section>

      {/* Grid de obras */}
      {destaques.length > 0 && (
        <section className="space-y-12">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Algumas obras
              </h2>
              <p className="font-light text-muted-foreground">
                Destaques selecionados da exposição
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Galeria digital
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:gap-10">
            {destaques.map((obra) => (
              <Link
                key={obra.num}
                to="/obras/$num"
                params={{ num: String(obra.num) }}
                className="group"
              >
                <div className="relative mb-4 aspect-square overflow-hidden rounded-sm bg-muted ring-1 ring-border transition-all group-hover:ring-accent">
                  <img
                    src={obra.imagem!}
                    alt={`Obra ${obra.num}: ${obra.titulo}, de Elifas Andreato, ${obra.ano}.`}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="line-clamp-1 font-serif text-lg font-semibold text-card-foreground transition-colors group-hover:text-accent">
                  {obra.titulo}
                </h3>
                <p className="text-sm font-light text-muted-foreground">{obra.ano}</p>
              </Link>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-12 px-12 text-base uppercase tracking-[0.2em]"
            >
              <Link to="/obras">Ver todas as {obras.length} obras</Link>
            </Button>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
