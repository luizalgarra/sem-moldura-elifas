import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Route as RouteIcon, Search, X, LayoutGrid, List } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { paredesOrdem } from "@/data/obras";
import { listarAcervo, type ObraAcervo } from "@/lib/admin-obras.functions";
import {
  classificar,
  type Classificacao,
  TIPOS,
  FUNCOES,
  PERIODOS,
  type Tipo,
  type Funcao,
  type Periodo,
} from "@/lib/categorias";
import { ObraCard } from "@/components/ObraCard";
import { ObraLinha } from "@/components/ObraLinha";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const tipoSchema = z.enum([
  "pinturas",
  "ilustracao",
  "colagens",
  "madeira",
  "fotografia",
  "audiovisual",
]);
const funcaoSchema = z.enum([
  "mpb",
  "imprensa",
  "cartazes",
  "autoral",
  "audiovisual",
]);
const periodoSchema = z.enum([
  "1960-70",
  "1980",
  "1990-2000",
  "2010+",
  "sem-data",
]);

const searchSchema = z.object({
  tipo: fallback(tipoSchema.or(z.literal("todos")), "todos").default("todos"),
  funcao: fallback(funcaoSchema.or(z.literal("todos")), "todos").default(
    "todos",
  ),
  periodo: fallback(periodoSchema.or(z.literal("todos")), "todos").default(
    "todos",
  ),
  busca: fallback(z.string(), "").default(""),
  vista: fallback(z.enum(["grade", "lista"]), "grade").default("grade"),
});

export const Route = createFileRoute("/obras/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Acervo — Elifas Andreato: Além da Moldura" },
      {
        name: "description",
        content:
          "Navegue pelas obras da exposição Elifas Andreato: Além da Moldura por tipo, função e período.",
      },
    ],
  }),
  loader: () => listarAcervo(),
  component: Acervo,
});

type BuscaParams = z.infer<typeof searchSchema>;

interface ItemClassificado {
  obra: ObraAcervo;
  cat: Classificacao;
}

function agruparPorParede(
  lista: ObraAcervo[],
): { parede: string; obras: ObraAcervo[] }[] {
  const grupos = new Map<string, ObraAcervo[]>();
  for (const obra of lista) {
    const arr = grupos.get(obra.parede) ?? [];
    arr.push(obra);
    grupos.set(obra.parede, arr);
  }
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
  const { tipo, funcao, periodo, busca, vista } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // Pré-classifica todas as obras uma vez.
  const classificadas = useMemo(
    () => lista.map((o: ObraAcervo) => ({ obra: o, cat: classificar(o) })),
    [lista],
  );

  // Contagens por Tipo (respeitando os demais filtros e busca).
  const termo = busca.trim().toLowerCase();
  const casaBusca = (o: ObraAcervo) =>
    !termo ||
    o.titulo.toLowerCase().includes(termo) ||
    o.ano.toLowerCase().includes(termo) ||
    String(o.num) === termo;

  const contagemTipos = useMemo(() => {
    const mapa = new Map<Tipo | "todos", number>();
    let total = 0;
    for (const { obra, cat } of classificadas) {
      if (!casaBusca(obra)) continue;
      if (funcao !== "todos" && cat.funcao !== funcao) continue;
      if (periodo !== "todos" && cat.periodo !== periodo) continue;
      total += 1;
      mapa.set(cat.tipo, (mapa.get(cat.tipo) ?? 0) + 1);
    }
    mapa.set("todos", total);
    return mapa;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classificadas, funcao, periodo, termo]);

  const obrasFiltradas = useMemo(
    () =>
      classificadas
        .filter(({ obra, cat }: ItemClassificado) => {
          if (!casaBusca(obra)) return false;
          if (tipo !== "todos" && cat.tipo !== tipo) return false;
          if (funcao !== "todos" && cat.funcao !== funcao) return false;
          if (periodo !== "todos" && cat.periodo !== periodo) return false;
          return true;
        })
        .map(({ obra }: ItemClassificado) => obra),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classificadas, tipo, funcao, periodo, termo],
  );

  const grupos = useMemo(
    () => agruparPorParede(obrasFiltradas),
    [obrasFiltradas],
  );
  const total = obrasFiltradas.length;
  const filtrosAtivos =
    tipo !== "todos" || funcao !== "todos" || periodo !== "todos" || !!termo;

  const set = (patch: Partial<BuscaParams>) =>
    navigate({ to: "/obras", search: (prev: BuscaParams) => ({ ...prev, ...patch }) });

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

      <header className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Acervo da exposição
        </h1>
        <p className="mt-2 text-muted-foreground">
          {lista.length} obras — navegue por tipo, função e período.
        </p>
        <div className="relative mt-5 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={busca}
            onChange={(e) => set({ busca: e.target.value })}
            placeholder="Buscar por título, ano ou número"
            aria-label="Buscar obras por título, ano ou número"
            className="h-12 pl-10 text-base"
          />
        </div>
      </header>

      {/* Abas por Tipo */}
      <div
        role="tablist"
        aria-label="Filtrar por tipo de obra"
        className="mb-4 flex flex-wrap gap-2 border-b border-border pb-3"
      >
        <TabBtn
          ativo={tipo === "todos"}
          onClick={() => set({ tipo: "todos" })}
          rotulo="Todos"
          contagem={contagemTipos.get("todos") ?? 0}
        />
        {TIPOS.map((t) => (
          <TabBtn
            key={t.valor}
            ativo={tipo === t.valor}
            onClick={() => set({ tipo: t.valor })}
            rotulo={t.rotulo}
            contagem={contagemTipos.get(t.valor) ?? 0}
          />
        ))}
      </div>

      {/* Filtros: Função e Período */}
      <div className="mb-8 space-y-3">
        <FiltroLinha
          legenda="Função"
          atual={funcao}
          opcoes={FUNCOES}
          onPick={(v) => set({ funcao: v as Funcao | "todos" })}
        />
        <FiltroLinha
          legenda="Período"
          atual={periodo}
          opcoes={PERIODOS}
          onPick={(v) => set({ periodo: v as Periodo | "todos" })}
        />
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground" role="status">
            {total} {total === 1 ? "obra" : "obras"}
          </p>
          <div className="flex items-center gap-2">
            {filtrosAtivos && (
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/obras",
                    search: (prev: BuscaParams) => ({
                      ...prev,
                      tipo: "todos",
                      funcao: "todos",
                      periodo: "todos",
                      busca: "",
                    }),
                  })
                }
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                <X className="size-4" aria-hidden="true" />
                Limpar filtros
              </button>
            )}
            <div
              className="flex items-center gap-1 rounded-full border border-border p-1"
              role="group"
              aria-label="Modo de visualização"
            >
              <button
                type="button"
                aria-pressed={vista === "grade"}
                onClick={() => set({ vista: "grade" })}
                aria-label="Ver em grade"
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full transition-colors",
                  vista === "grade"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-accent",
                )}
              >
                <LayoutGrid className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-pressed={vista === "lista"}
                onClick={() => set({ vista: "lista" })}
                aria-label="Ver em lista"
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full transition-colors",
                  vista === "lista"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-accent",
                )}
              >
                <List className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
          {filtrosAtivos && (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/obras",
                  search: {
                    tipo: "todos",
                    funcao: "todos",
                    periodo: "todos",
                    busca: "",
                  },
                })
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              <X className="size-4" aria-hidden="true" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {grupos.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma obra para esta combinação de filtros.
          </p>
          {filtrosAtivos && (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/obras",
                  search: {
                    tipo: "todos",
                    funcao: "todos",
                    periodo: "todos",
                    busca: "",
                  },
                })
              }
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              <X className="size-4" aria-hidden="true" />
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {grupos.map((grupo) => (
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

function TabBtn({
  ativo,
  onClick,
  rotulo,
  contagem,
}: {
  ativo: boolean;
  onClick: () => void;
  rotulo: string;
  contagem: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        ativo
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent",
      )}
    >
      {rotulo}
      <span className="ml-1.5 opacity-70">{contagem}</span>
    </button>
  );
}

function FiltroLinha({
  legenda,
  atual,
  opcoes,
  onPick,
}: {
  legenda: string;
  atual: string;
  opcoes: { valor: string; rotulo: string }[];
  onPick: (valor: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-16 shrink-0 text-sm font-semibold text-foreground">
        {legenda}
      </span>
      <Chip ativo={atual === "todos"} onClick={() => onPick("todos")}>
        Todas
      </Chip>
      {opcoes.map((o) => (
        <Chip
          key={o.valor}
          ativo={atual === o.valor}
          onClick={() => onPick(o.valor)}
        >
          {o.rotulo}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        ativo
          ? "border-accent bg-accent/15 text-accent"
          : "border-border text-muted-foreground hover:border-accent hover:text-accent",
      )}
    >
      {children}
    </button>
  );
}
