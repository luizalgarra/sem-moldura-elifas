import { createFileRoute, Link } from "@tanstack/react-router";
import { marcos, anosMarcos } from "@/data/timeline";
import { marcoDaObra } from "@/lib/anos";
import { listarAcervo, type ObraAcervo } from "@/lib/admin-obras.functions";

export const Route = createFileRoute("/linhas-da-vida")({
  loader: () => listarAcervo(),
  head: () => ({
    meta: [
      { title: "Linhas da Vida — Elifas Andreato: Além da Moldura" },
      {
        name: "description",
        content:
          "Linha do tempo da trajetória de Elifas Andreato (1946–2022): da infância no Paraná à consagração como artista, designer e ativista.",
      },
      { property: "og:title", content: "Linhas da Vida — Elifas Andreato" },
      {
        property: "og:description",
        content:
          "A trajetória de Elifas Andreato em linha do tempo: arte, música, teatro e resistência (1946–2022).",
      },
    ],
  }),
  component: LinhasDaVida,
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
      Não foi possível carregar a linha do tempo. Tente novamente.
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
      Conteúdo não encontrado.
    </div>
  ),
});

/** Agrupa as obras do acervo pelo marco correspondente (exato ou mais próximo). */
function obrasPorMarco(acervo: ObraAcervo[]): Map<number, ObraAcervo[]> {
  const mapa = new Map<number, ObraAcervo[]>();
  for (const obra of acervo) {
    const corresp = marcoDaObra(obra.ano, anosMarcos);
    if (!corresp) continue;
    const arr = mapa.get(corresp.marco) ?? [];
    arr.push(obra);
    mapa.set(corresp.marco, arr);
  }
  return mapa;
}

function LinhasDaVida() {
  const acervo = Route.useLoaderData();
  const agrupado = obrasPorMarco(acervo);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        Linhas da Vida
      </h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Uma linha do tempo da trajetória de Elifas Andreato — do menino lavrador
        do norte do Paraná ao artista, designer e ativista que marcou a cultura
        brasileira.
      </p>

      <ol className="mt-10 space-y-8 border-l border-border pl-6">
        {marcos.map((marco) => {
          const obras = agrupado.get(Number(marco.ano)) ?? [];
          return (
            <li
              key={marco.ano}
              id={`ano-${marco.ano}`}
              className="relative scroll-mt-24"
            >
              <span
                className="absolute -left-[calc(1.5rem+0.4375rem)] top-1.5 size-3.5 rounded-full border-2 border-accent bg-background"
                aria-hidden="true"
              />
              <h2 className="font-serif text-2xl font-bold text-accent">
                {marco.ano}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {marco.texto}
              </p>

              {obras.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Obras relacionadas
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {obras.map((obra) => (
                      <li key={obra.num}>
                        <Link
                          to="/obras/$num"
                          params={{ num: String(obra.num) }}
                          className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {obra.titulo}
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            {obra.ano}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
