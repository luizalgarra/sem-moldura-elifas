import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, QrCode as QrIcon, Headphones } from "lucide-react";
import { obras } from "@/data/obras";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elifas Andreato: Sem Moldura — Catálogo Virtual" },
      {
        name: "description",
        content:
          "Catálogo virtual da exposição 80 anos de Elifas Andreato: Sem Moldura. 116 obras com áudio-descrição e acesso por QR Code.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const destaques = obras.filter((o) => o.imagem).slice(0, 6);

  return (
    <div>
      <section className="bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="font-medium uppercase tracking-[0.3em] text-primary">
            Exposição · 80 anos
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-foreground sm:text-6xl">
            Elifas Andreato
            <span className="block text-primary">Sem Moldura</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Um catálogo virtual para percorrer as {obras.length} obras da exposição.
            Cada obra pode ser ouvida em áudio-descrição e acessada pelo QR Code
            impresso na galeria.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="min-h-12 text-base">
              <Link to="/obras">
                Ver o acervo
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 text-base">
              <Link to="/como-usar">Como usar o QR Code</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <Headphones className="size-7 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-serif text-xl font-semibold text-card-foreground">
              Áudio-descrição em todas as obras
            </h2>
            <p className="mt-2 text-muted-foreground">
              Ouça a descrição de cada obra com a voz do próprio navegador,
              em português, no seu ritmo.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <QrIcon className="size-7 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-serif text-xl font-semibold text-card-foreground">
              Acesso pelo QR Code
            </h2>
            <p className="mt-2 text-muted-foreground">
              Aponte a câmera para o QR Code ao lado da obra na exposição e
              continue navegando pelo acervo completo.
            </p>
          </div>
        </div>
      </section>

      {destaques.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Algumas obras
            </h2>
            <Link to="/obras" className="text-sm font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {destaques.map((obra) => (
              <Link
                key={obra.num}
                to="/obras/$num"
                params={{ num: String(obra.num) }}
                className="group overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="aspect-square bg-muted">
                  <img
                    src={obra.imagem!}
                    alt={`Obra ${obra.num}: ${obra.titulo}, de Elifas Andreato, ${obra.ano}.`}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 font-serif font-semibold text-card-foreground">
                    {obra.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground">{obra.ano}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
