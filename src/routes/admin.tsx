import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Save,
  RefreshCw,
  Search,
  Download,
  Sparkles,
  Images,
  History,
  RotateCcw,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { obras } from "@/data/obras";
import {
  listarOverrides,
  salvarTexto,
  salvarAudiodescricao,
  regenerarAudio,
  gerarTextoDescricao,
  cadastrarImagensEstaticas,
  listarVersoes,
  restaurarVersaoTexto,
  restaurarVersaoAudio,
  definirAprovacao,
  type OverrideObra,
} from "@/lib/admin-obras.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";



export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração — Textos e áudios" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPagina,
});

/** Status de produção de uma obra, derivado da presença de dados. */
type StatusObra = "sem-gerar" | "texto" | "locucao" | "aprovada";

function statusDaObra(override: OverrideObra | undefined): StatusObra {
  if (override?.aprovada) return "aprovada";
  if (override?.audioFemPath) return "locucao";
  if (override?.audiodescricao && override.audiodescricao.trim()) return "texto";
  return "sem-gerar";
}

const STATUS_ROTULO: Record<StatusObra, string> = {
  "sem-gerar": "Sem gerar",
  texto: "Texto gerado",
  locucao: "Locução gerada",
  aprovada: "Aprovada",
};

const FILTROS: { valor: StatusObra | "todas"; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "sem-gerar", rotulo: "Sem gerar" },
  { valor: "texto", rotulo: "Texto gerado" },
  { valor: "locucao", rotulo: "Locução gerada" },
  { valor: "aprovada", rotulo: "Aprovada" },
];

function AdminPagina() {
  const fetchOverrides = useServerFn(listarOverrides);
  const { data: overrides, refetch } = useQuery({
    queryKey: ["overrides"],
    queryFn: () => fetchOverrides(),
  });

  const mapa = useMemo(() => {
    const m = new Map<number, OverrideObra>();
    (overrides ?? []).forEach((o) => m.set(o.num, o));
    return m;
  }, [overrides]);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusObra | "todas">(
    "todas",
  );

  // Geração em lote (todas as obras).
  const regenerar = useServerFn(regenerarAudio);
  const [loteRodando, setLoteRodando] = useState(false);
  const [loteFeito, setLoteFeito] = useState(0);
  const [loteMsg, setLoteMsg] = useState<string | null>(null);

  // Cadastro em lote das imagens estáticas para a IA.
  const cadastrarImagens = useServerFn(cadastrarImagensEstaticas);
  const [imgRodando, setImgRodando] = useState(false);
  const [imgMsg, setImgMsg] = useState<string | null>(null);


  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return obras.filter((o) => {
      const correspondeBusca =
        !q ||
        String(o.num).includes(q) ||
        o.titulo.toLowerCase().includes(q);
      if (!correspondeBusca) return false;
      if (filtroStatus === "todas") return true;
      return statusDaObra(mapa.get(o.num)) === filtroStatus;
    });
  }, [busca, filtroStatus, mapa]);



  const handleLote = async () => {
    const alvos = obras;
    setLoteRodando(true);
    setLoteFeito(0);
    setLoteMsg(null);
    let falhas = 0;
    for (let i = 0; i < alvos.length; i++) {
      try {
        const r = await regenerar({ data: { chave: alvos[i].num } });
        if (!r.ok) falhas++;
      } catch {
        falhas++;
      }
      setLoteFeito(i + 1);
    }
    setLoteRodando(false);
    setLoteMsg(
      falhas === 0
        ? `Pronto! ${alvos.length} obras com locução gerada.`
        : `Concluído com ${falhas} falha(s) de ${alvos.length}.`,
    );
    refetch();
  };

  const handleCadastrarImagens = async () => {
    setImgRodando(true);
    setImgMsg(null);
    try {
      const r = await cadastrarImagens();
      if (r.ok) {
        setImgMsg(
          r.total === 0
            ? "Todas as obras com imagem já estão cadastradas para a IA."
            : `Pronto! ${r.gravadas} de ${r.total} imagem(ns) cadastrada(s)` +
                (r.falhas > 0 ? `, ${r.falhas} falha(s).` : "."),
        );
        refetch();
      } else {
        setImgMsg(r.erro ?? "Erro ao cadastrar as imagens.");
      }
    } catch {
      setImgMsg("Erro ao cadastrar as imagens.");
    } finally {
      setImgRodando(false);
    }
  };



  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Administração de textos e áudios
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edite a descrição de cada obra e gere a locução (voz única).
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-4">
        <Button
          onClick={handleLote}
          disabled={loteRodando}
          className="min-h-11"
        >
          {loteRodando ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}
          <span>Gerar locução de todas as obras</span>
        </Button>
        {loteRodando && (
          <span className="text-sm text-muted-foreground" role="status">
            Gerando… {loteFeito}/{obras.length}
          </span>
        )}
        {!loteRodando && loteMsg && (
          <span className="text-sm text-muted-foreground" role="status">
            {loteMsg}
          </span>
        )}

        <Button
          variant="outline"
          onClick={handleCadastrarImagens}
          disabled={imgRodando}
          className="min-h-11"
        >
          {imgRodando ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Images aria-hidden="true" />
          )}
          <span>Cadastrar imagens das obras (IA)</span>
        </Button>
        {imgMsg && (
          <span className="text-sm text-muted-foreground" role="status">
            {imgMsg}
          </span>
        )}
      </div>


      <div className="sticky top-0 z-10 -mx-4 mt-6 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número ou título…"
            className="pl-9"
            aria-label="Buscar obra"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTROS.map((f) => {
            const ativo = filtroStatus === f.valor;
            const total =
              f.valor === "todas"
                ? obras.length
                : obras.filter(
                    (o) => statusDaObra(mapa.get(o.num)) === f.valor,
                  ).length;
            return (
              <Button
                key={f.valor}
                size="sm"
                variant={ativo ? "default" : "outline"}
                onClick={() => setFiltroStatus(f.valor)}
                aria-pressed={ativo}
              >
                {f.rotulo}
                <span className="ml-1 opacity-70">({total})</span>
              </Button>
            );
          })}
        </div>
      </div>


      <ul className="mt-4 space-y-4">
        {filtradas.map((obra) => (
          <ObraEditor
            key={obra.num}
            num={obra.num}
            titulo={obra.titulo}
            textoEstatico={obra.descricao}
            audioEstatico={obra.audio}
            override={mapa.get(obra.num)}
            onChanged={() => refetch()}
          />
        ))}
      </ul>
    </div>
  );
}

/** Versão (cache-buster) derivada do `updatedAt` do override salvo no banco. */
function versaoDeOverride(override: OverrideObra | undefined): string {
  return override?.updatedAt
    ? new Date(override.updatedAt).getTime().toString()
    : Date.now().toString();
}

function ObraEditor({

  num,
  titulo,
  textoEstatico,
  audioEstatico,
  override,
  onChanged,
}: {
  num: number;
  titulo: string;
  textoEstatico: string;
  audioEstatico: string | null;
  override: OverrideObra | undefined;
  onChanged: () => void;
}) {
  const salvar = useServerFn(salvarTexto);
  const salvarAudio = useServerFn(salvarAudiodescricao);
  const regenerar = useServerFn(regenerarAudio);
  const gerarTexto = useServerFn(gerarTextoDescricao);

  const [texto, setTexto] = useState(override?.descricao ?? textoEstatico);
  const [audiodescricao, setAudiodescricao] = useState(
    override?.audiodescricao ?? override?.descricao ?? textoEstatico,
  );
  const [salvando, setSalvando] = useState(false);
  const [salvandoAudio, setSalvandoAudio] = useState(false);
  const [gerando, setGerando] = useState(false);
  
  const [gerandoTexto, setGerandoTexto] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [versaoAudio, setVersaoAudio] = useState<string | null>(
    override?.audioFemPath ? versaoDeOverride(override) : null,
  );
  const [histKey, setHistKey] = useState(0);
  const recarregarHist = () => setHistKey((k) => k + 1);

  // Sincroniza com o banco quando os dados recarregam (refetch). Assim a tela
  // reflete o áudio recém-salvo em vez de "voltar ao estado" anterior.
  useEffect(() => {
    if (override?.audioFemPath) {
      setVersaoAudio(versaoDeOverride(override));
    }
  }, [override?.audioFemPath, override?.updatedAt]);

  const temAudioRegen = versaoAudio !== null && !!override?.audioFemPath;


  const handleSalvar = async () => {
    setSalvando(true);
    setMsg(null);
    try {
      const r = await salvar({ data: { chave: num, descricao: texto } });
      setMsg(r.ok ? "Descrição salva." : (r.erro ?? "Erro ao salvar."));
      if (r.ok) {
        onChanged();
      }
    } catch {
      setMsg("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarAudio = async () => {
    setSalvandoAudio(true);
    setMsg(null);
    try {
      const r = await salvarAudio({
        data: { chave: num, audiodescricao },
      });
      setMsg(r.ok ? "Audiodescrição salva." : (r.erro ?? "Erro ao salvar."));
      if (r.ok) {
        onChanged();
        recarregarHist();
      }
    } catch {
      setMsg("Erro ao salvar.");
    } finally {
      setSalvandoAudio(false);
    }
  };

  const handleRegenerar = async () => {
    setGerando(true);
    setMsg(null);
    try {
      const r = await regenerar({ data: { chave: num, audiodescricao } });
      if (r.ok) {
        setVersaoAudio(r.versao);
        setMsg("Locução gerada e salva.");
        onChanged();
        recarregarHist();
      } else {
        setMsg(r.erro ?? "Erro ao gerar.");
      }
    } catch {
      setMsg("Erro ao gerar.");
    } finally {
      setGerando(false);
    }
  };

  const handleGerarTexto = async () => {
    setGerandoTexto(true);
    setMsg(null);
    try {
      const r = await gerarTexto({ data: { chave: num } });
      if (r.ok) {
        setAudiodescricao(r.texto);
        setMsg("Audiodescrição gerada — revise e salve.");
        recarregarHist();
      } else {
        setMsg(r.erro ?? "Erro ao gerar o texto.");
      }
    } catch {
      setMsg("Erro ao gerar o texto.");
    } finally {
      setGerandoTexto(false);
    }
  };




  const audioRegenSrc = temAudioRegen
    ? `/api/public/obra-audio/${num}?voz=fem&v=${versaoAudio}`
    : null;

  const downloadSrc = temAudioRegen
    ? `/api/public/obra-audio/${num}?voz=fem&download=1&v=${versaoAudio}`
    : audioEstatico;

  const handleBaixar = async () => {
    if (!downloadSrc || baixando) return;
    setMsg(null);
    setBaixando(true);
    try {
      // iOS Safari ignora o atributo `download` em URLs de servidor e navega
      // para fora (zerando o estado). Baixar como blob evita qualquer navegação.
      const resp = await fetch(downloadSrc);
      if (!resp.ok) throw new Error("falha no download");
      const blob = await resp.blob();
      const nome = `obra-${num}.mp3`;

      // iOS/mobile: compartilhamento nativo (inclui "Salvar em Arquivos").
      const file = new File([blob], nome, { type: "audio/mpeg" });
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: nome });
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return; // usuário cancelou
          // share indisponível: segue para o fallback por link
        }
      }

      // Fallback (desktop/navegadores sem Web Share): link com object URL.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMsg("Não foi possível baixar o áudio.");
    } finally {
      setBaixando(false);
    }
  };

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-medium text-foreground">
          <span className="text-accent">#{num}</span> {titulo}
        </h2>
        {override?.descricao && (
          <span className="text-xs text-muted-foreground">editado</span>
        )}
      </div>

      <div className="mt-3">
        <label
          htmlFor={`descricao-${num}`}
          className="text-xs font-semibold uppercase text-muted-foreground"
        >
          Descrição (referência)
        </label>
        <Textarea
          id={`descricao-${num}`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={5}
          className="mt-1"
          aria-label={`Descrição de referência da obra ${num}`}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            onClick={handleSalvar}
            disabled={salvando}
            className="min-h-11"
          >
            {salvando ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Save aria-hidden="true" />
            )}
            <span>Salvar descrição</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleGerarTexto}
            disabled={gerandoTexto}
            className="min-h-11"
          >
            {gerandoTexto ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles aria-hidden="true" />
            )}
            <span>Gerar audiodescrição (IA)</span>
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`audiodescricao-${num}`}
          className="text-xs font-semibold uppercase text-muted-foreground"
        >
          Texto da audiodescrição (locução)
        </label>
        <Textarea
          id={`audiodescricao-${num}`}
          value={audiodescricao}
          onChange={(e) => setAudiodescricao(e.target.value)}
          rows={6}
          className="mt-1"
          aria-label={`Texto da audiodescrição da obra ${num}`}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            onClick={handleSalvarAudio}
            disabled={salvandoAudio}
            className="min-h-11"
          >
            {salvandoAudio ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Save aria-hidden="true" />
            )}
            <span>Salvar audiodescrição</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleRegenerar}
            disabled={gerando}
            className="min-h-11"
          >
            {gerando ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw aria-hidden="true" />
            )}
            <span>Gerar locução</span>
          </Button>

          {downloadSrc && (
            <Button
              variant="outline"
              onClick={handleBaixar}
              disabled={baixando}
              className="min-h-11"
            >
              <Download aria-hidden="true" />
              <span>{baixando ? "Baixando…" : "Baixar áudio"}</span>
            </Button>
          )}

          {msg && (
            <span className="text-sm text-muted-foreground" role="status">
              {msg}
            </span>
          )}
        </div>
      </div>


      {audioRegenSrc && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">Locução gerada</p>
          <audio
            controls
            preload="none"
            src={audioRegenSrc}
            className="mt-1 w-full"
          >
            Seu navegador não suporta áudio.
          </audio>
        </div>
      )}

      <Historico
        num={num}
        refreshKey={histKey}
        onRestaurarTexto={(t) => setAudiodescricao(t)}
        onRestaurarAudio={(v) => setVersaoAudio(v)}
      />
    </li>
  );
}

function dataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function Historico({
  num,
  refreshKey,
  onRestaurarTexto,
  onRestaurarAudio,
}: {
  num: number;
  refreshKey: number;
  onRestaurarTexto: (texto: string) => void;
  onRestaurarAudio: (versao: string) => void;
}) {
  const listar = useServerFn(listarVersoes);
  const restTexto = useServerFn(restaurarVersaoTexto);
  const restAudio = useServerFn(restaurarVersaoAudio);

  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [textos, setTextos] = useState<
    { id: string; origem: "ia" | "manual"; descricao: string; createdAt: string }[]
  >([]);
  const [audios, setAudios] = useState<
    { id: string; origem: "ia" | "manual"; createdAt: string }[]
  >([]);
  const [restaurandoId, setRestaurandoId] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const r = await listar({ data: { chave: num } });
      if (r.ok) {
        setTextos(r.textos);
        setAudios(r.audios);
      } else {
        setErro(r.erro ?? "Erro ao carregar.");
      }
    } catch {
      setErro("Erro ao carregar.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (aberto) void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, refreshKey]);

  const handleRestTexto = async (id: string) => {
    setRestaurandoId(id);
    try {
      const r = await restTexto({ data: { id } });
      if (r.ok) onRestaurarTexto(r.texto);
      else setErro(r.erro ?? "Erro ao restaurar.");
    } catch {
      setErro("Erro ao restaurar.");
    } finally {
      setRestaurandoId(null);
    }
  };

  const handleRestAudio = async (id: string) => {
    setRestaurandoId(id);
    try {
      const r = await restAudio({ data: { id } });
      if (r.ok) {
        onRestaurarAudio(r.versao);
        setAudioPreview(`/api/public/obra-audio/${num}?voz=fem&v=${r.versao}`);
      } else {
        setErro(r.erro ?? "Erro ao restaurar.");
      }
    } catch {
      setErro("Erro ao restaurar.");
    } finally {
      setRestaurandoId(null);
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
        aria-expanded={aberto}
      >
        <History className="h-4 w-4" aria-hidden="true" />
        <span>Histórico {aberto ? "▲" : "▼"}</span>
      </button>

      {aberto && (
        <div className="mt-3 space-y-4">
          {carregando && (
            <p className="text-sm text-muted-foreground" role="status">
              Carregando…
            </p>
          )}
          {erro && (
            <p className="text-sm text-destructive" role="alert">
              {erro}
            </p>
          )}

          {!carregando && (
            <>
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Texto (últimas 3)
                </h3>
                {textos.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sem versões ainda.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {textos.map((v) => (
                      <li
                        key={v.id}
                        className="rounded-md border border-border bg-background p-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {dataHora(v.createdAt)} ·{" "}
                            {v.origem === "ia" ? "IA" : "manual"}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestTexto(v.id)}
                            disabled={restaurandoId === v.id}
                          >
                            {restaurandoId === v.id ? (
                              <Loader2
                                className="h-3 w-3 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <RotateCcw className="h-3 w-3" aria-hidden="true" />
                            )}
                            <span>Restaurar</span>
                          </Button>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-foreground">
                          {v.descricao}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Áudio (últimas 3)
                </h3>
                {audios.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sem versões ainda.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {audios.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-2"
                      >
                        <span className="text-xs text-muted-foreground">
                          {dataHora(v.createdAt)} ·{" "}
                          {v.origem === "ia" ? "IA" : "manual"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestAudio(v.id)}
                          disabled={restaurandoId === v.id}
                        >
                          {restaurandoId === v.id ? (
                            <Loader2
                              className="h-3 w-3 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          )}
                          <span>Restaurar</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {audioPreview && (
                  <audio
                    controls
                    preload="none"
                    src={audioPreview}
                    className="mt-2 w-full"
                  >
                    Seu navegador não suporta áudio.
                  </audio>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
