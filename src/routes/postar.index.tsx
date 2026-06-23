import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Video,
  Loader2,
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  listarAcervoAdmin,
  contarPostagensPorObra,
  salvarPostagemReels,
  type ObraAcervo,
} from "@/lib/admin-obras.functions";
import { blobParaBase64, gerarReelsDaObra, obraApta } from "@/lib/gerar-reels";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/postar/")({
  head: () => ({
    meta: [
      { title: "Gerar reels em lote" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PostarLotePagina,
});

type StatusItem =
  | "fila"
  | "gerando"
  | "salvando"
  | "salvo"
  | "erro"
  | "pulada";

interface ResultadoItem {
  status: StatusItem;
  pct: number;
  etapa?: string;
  msg?: string;
}

const ROTULO_ETAPA: Record<string, string> = {
  imagem: "Carregando imagem",
  audio: "Carregando áudio",
  ffmpeg: "Carregando conversor",
  encode: "Gerando MP4",
  finalizando: "Finalizando",
};


function suportaGeracao(): boolean {
  if (typeof window === "undefined") return false;
  const canvasOk = typeof HTMLCanvasElement !== "undefined";
  const audioOk =
    typeof window.AudioContext !== "undefined" ||
    typeof (window as unknown as { webkitAudioContext?: unknown })
      .webkitAudioContext !== "undefined";
  return canvasOk && audioOk;
}

const ROTULO_STATUS: Record<StatusItem, string> = {
  fila: "Na fila",
  gerando: "Gerando MP4",
  salvando: "Salvando",
  salvo: "Salvo",
  erro: "Erro",
  pulada: "Pulada",
};

function PostarLotePagina() {
  const suportado = useMemo(suportaGeracao, []);
  const { session, isAdmin } = useAdminAuth();

  const fetchAcervo = useServerFn(listarAcervoAdmin);
  const { data: acervo } = useQuery({
    queryKey: ["acervo-admin"],
    queryFn: () => fetchAcervo(),
    enabled: Boolean(session) && isAdmin,
  });

  const fetchContagem = useServerFn(contarPostagensPorObra);
  const { data: contagem, refetch: refetchContagem } = useQuery({
    queryKey: ["contagem-postagens-por-obra"],
    queryFn: () => fetchContagem(),
    enabled: Boolean(session) && isAdmin,
  });

  const salvar = useServerFn(salvarPostagemReels);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const lista = useMemo(() => acervo ?? [], [acervo]);
  const aptas = useMemo(() => lista.filter(obraApta), [lista]);

  // Controles do lote.
  const [inicioNum, setInicioNum] = useState<number>(1);
  const [quantidade, setQuantidade] = useState<string>("10");
  const [pularExistentes, setPularExistentes] = useState(true);

  // Estado de execução.
  const [rodando, setRodando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [resultados, setResultados] = useState<Record<number, ResultadoItem>>(
    {},
  );
  const [atual, setAtual] = useState<number | null>(null);
  const [resumo, setResumo] = useState<{
    geradas: number;
    puladas: number;
    erros: number;
  } | null>(null);

  const pausadoRef = useRef(false);
  const canceladoRef = useRef(false);

  // Define o ponto de início padrão na primeira obra apta.
  useEffect(() => {
    if (aptas.length > 0) {
      setInicioNum((prev) =>
        lista.some((o) => o.num === prev) ? prev : aptas[0].num,
      );
    }
  }, [aptas, lista]);

  const setItem = useCallback((num: number, parcial: Partial<ResultadoItem>) => {
    setResultados((prev) => {
      const base: ResultadoItem = prev[num] ?? { status: "fila", pct: 0 };
      return { ...prev, [num]: { ...base, ...parcial } };
    });
  }, []);

  const esperarSeP_ausado = useCallback(async () => {
    while (pausadoRef.current && !canceladoRef.current) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }, []);

  /** Monta a fila de obras a processar a partir dos controles. */
  const montarFila = useCallback(
    (apenas?: number[]): ObraAcervo[] => {
      let fila = aptas.filter((o) => o.num >= inicioNum);
      if (apenas) {
        const set = new Set(apenas);
        fila = aptas.filter((o) => set.has(o.num));
      }
      if (pularExistentes && !apenas) {
        fila = fila.filter((o) => (contagem?.[o.num] ?? 0) === 0);
      }
      const n = parseInt(quantidade, 10);
      if (!apenas && Number.isFinite(n) && n > 0) {
        fila = fila.slice(0, n);
      }
      return fila;
    },
    [aptas, inicioNum, pularExistentes, contagem, quantidade],
  );

  const executar = useCallback(
    async (fila: ObraAcervo[]) => {
      if (fila.length === 0) return;
      canceladoRef.current = false;
      pausadoRef.current = false;
      setPausado(false);
      setRodando(true);
      setResumo(null);

      // Inicializa os itens da fila.
      setResultados((prev) => {
        const novo = { ...prev };
        for (const o of fila) novo[o.num] = { status: "fila", pct: 0 };
        return novo;
      });

      let geradas = 0;
      let puladas = 0;
      let erros = 0;

      for (const obra of fila) {
        if (canceladoRef.current) break;
        await esperarSeP_ausado();
        if (canceladoRef.current) break;

        setAtual(obra.num);
        setItem(obra.num, {
          status: "gerando",
          pct: 0,
          etapa: "imagem",
          msg: undefined,
        });

        try {
          const blob = await gerarReelsDaObra(obra, {
            canvas: canvasRef.current!,
            escolha: "sequencia",
            onProgress: (pct) => setItem(obra.num, { pct }),
            onEtapa: (etapa) => setItem(obra.num, { etapa }),
          });


          setItem(obra.num, { status: "salvando", pct: 100 });
          const base64 = await blobParaBase64(blob);
          const res = await salvar({
            data: {
              num: obra.num,
              titulo: obra.titulo,
              base64,
              ext: "mp4",
            },
          });

          if (res?.ok) {
            geradas += 1;
            setItem(obra.num, { status: "salvo" });
          } else {
            erros += 1;
            setItem(obra.num, {
              status: "erro",
              msg: res?.erro ?? "Falha ao salvar.",
            });
          }
        } catch (e) {
          erros += 1;
          console.error("Lote — obra", obra.num, e);
          setItem(obra.num, {
            status: "erro",
            msg:
              e instanceof Error
                ? e.message
                : typeof e === "string"
                  ? e
                  : "Erro inesperado.",
          });
        }
      }

      setAtual(null);
      setRodando(false);
      setPausado(false);
      setResumo({ geradas, puladas, erros });
      refetchContagem();
    },
    [esperarSeP_ausado, setItem, salvar, refetchContagem],
  );

  const iniciar = useCallback(() => {
    setResultados({});
    void executar(montarFila());
  }, [executar, montarFila]);

  const tentarFalhas = useCallback(() => {
    const falhas = Object.entries(resultados)
      .filter(([, r]) => r.status === "erro")
      .map(([num]) => Number(num));
    if (falhas.length > 0) void executar(montarFila(falhas));
  }, [resultados, executar, montarFila]);

  const alternarPausa = useCallback(() => {
    pausadoRef.current = !pausadoRef.current;
    setPausado(pausadoRef.current);
  }, []);

  const cancelar = useCallback(() => {
    canceladoRef.current = true;
    pausadoRef.current = false;
    setPausado(false);
  }, []);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Acesso restrito
        </h1>
        <p className="mt-2 text-muted-foreground">
          Entre como administrador para gerar reels em lote.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Entrar
        </Link>
      </div>
    );
  }

  const filaPrevista = montarFila();
  const total = filaPrevista.length;
  const concluidos = Object.values(resultados).filter(
    (r) => r.status === "salvo" || r.status === "erro" || r.status === "pulada",
  ).length;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/admin" className="text-sm font-medium text-accent hover:underline">
        ← Voltar à administração
      </Link>

      <header className="mt-4">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Administração
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Gerar reels em lote
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gera os vídeos de várias obras em sequência, direto no navegador.
          Mantenha esta aba aberta e em foco até terminar.
        </p>
      </header>

      {!suportado && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Este navegador não suporta a geração do vídeo. Use o Chrome, Edge ou
            Firefox no computador.
          </span>
        </div>
      )}

      {/* Controles */}
      <div className="mt-6 space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">
              Começar a partir de
            </span>
            <select
              value={inicioNum}
              onChange={(e) => setInicioNum(Number(e.target.value))}
              disabled={rodando}
              className="min-h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            >
              {lista.map((o) => (
                <option key={o.num} value={o.num} disabled={!obraApta(o)}>
                  {String(o.num).padStart(2, "0")} — {o.titulo}
                  {!obraApta(o) ? " (sem mídia)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">
              Quantidade (vazio = até o fim)
            </span>
            <input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              disabled={rodando}
              placeholder="até o fim"
              className="min-h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={pularExistentes}
            onCheckedChange={(v) => setPularExistentes(Boolean(v))}
            disabled={rodando}
          />
          Pular obras que já têm vídeo
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {!rodando ? (
            <Button
              onClick={iniciar}
              disabled={!suportado || total === 0}
              className="min-h-11"
            >
              <Play aria-hidden="true" />
              <span>
                {total > 0 ? `Gerar (${total} obras)` : "Nada a gerar"}
              </span>
            </Button>
          ) : (
            <>
              <Button
                onClick={alternarPausa}
                variant="outline"
                className="min-h-11"
              >
                {pausado ? (
                  <Play aria-hidden="true" />
                ) : (
                  <Pause aria-hidden="true" />
                )}
                <span>{pausado ? "Retomar" : "Pausar"}</span>
              </Button>
              <Button
                onClick={cancelar}
                variant="outline"
                className="min-h-11 text-destructive hover:text-destructive"
              >
                <Square aria-hidden="true" />
                <span>Cancelar</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progresso */}
      {(rodando || Object.keys(resultados).length > 0) && (
        <div className="mt-6 space-y-4">
          {rodando && (
            <div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {pausado
                    ? "Pausado"
                    : atual != null
                      ? `Gerando obra ${String(atual).padStart(2, "0")}…`
                      : "Processando…"}
                </span>
                <span>
                  {concluidos}/{Object.keys(resultados).length}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{
                    width: `${
                      Object.keys(resultados).length > 0
                        ? Math.round(
                            (concluidos / Object.keys(resultados).length) * 100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {resumo && (
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/50 p-4 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
                {resumo.geradas} geradas
              </span>
              <span className="text-muted-foreground">
                {resumo.erros} com erro
              </span>
              {resumo.erros > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={tentarFalhas}
                  className="min-h-10"
                >
                  <RotateCcw aria-hidden="true" />
                  <span>Tentar de novo as que falharam</span>
                </Button>
              )}
              <Link
                to="/postagens"
                className="font-medium text-accent hover:underline"
              >
                Ver postagens
              </Link>
            </div>
          )}

          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {lista
              .filter((o) => resultados[o.num])
              .map((o) => {
                const r = resultados[o.num];
                return (
                  <li
                    key={o.num}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <IconeStatus status={r.status} />
                    <span className="w-8 shrink-0 font-mono text-muted-foreground">
                      {String(o.num).padStart(2, "0")}
                    </span>
                    <span className="flex-1 truncate text-foreground">
                      {o.titulo}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {r.status === "gerando"
                        ? `${ROTULO_STATUS[r.status]} ${r.pct}%`
                        : r.status === "erro"
                          ? r.msg ?? ROTULO_STATUS[r.status]
                          : ROTULO_STATUS[r.status]}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {/* Canvas oculto reutilizado entre as obras. */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </article>
  );
}

function IconeStatus({ status }: { status: StatusItem }) {
  if (status === "salvo")
    return (
      <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />
    );
  if (status === "erro")
    return (
      <AlertTriangle
        className="size-4 shrink-0 text-destructive"
        aria-hidden="true"
      />
    );
  if (status === "gerando" || status === "salvando")
    return (
      <Loader2
        className="size-4 shrink-0 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    );
  if (status === "pulada")
    return (
      <SkipForward
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    );
  return (
    <Video className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
  );
}
