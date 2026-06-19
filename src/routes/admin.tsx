import { useMemo, useState } from "react";
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
} from "lucide-react";
import { obras } from "@/data/obras";
import {
  listarOverrides,
  salvarTexto,
  regenerarAudio,
  gerarTextoDescricao,
  cadastrarImagensEstaticas,
  listarVersoes,
  restaurarVersaoTexto,
  restaurarVersaoAudio,
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
    if (!q) return obras;
    return obras.filter(
      (o) =>
        String(o.num).includes(q) || o.titulo.toLowerCase().includes(q),
    );
  }, [busca]);



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
  const regenerar = useServerFn(regenerarAudio);
  const gerarTexto = useServerFn(gerarTextoDescricao);

  const [texto, setTexto] = useState(override?.descricao ?? textoEstatico);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [gerandoTexto, setGerandoTexto] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [versaoAudio, setVersaoAudio] = useState<string | null>(
    override?.audioFemPath ? Date.now().toString() : null,
  );
  const [histKey, setHistKey] = useState(0);
  const recarregarHist = () => setHistKey((k) => k + 1);

  const temAudioRegen = versaoAudio !== null && !!override?.audioFemPath;

  const handleSalvar = async () => {
    setSalvando(true);
    setMsg(null);
    try {
      const r = await salvar({ data: { chave: num, descricao: texto } });
      setMsg(r.ok ? "Texto salvo." : (r.erro ?? "Erro ao salvar."));
      if (r.ok) {
        onChanged();
        recarregarHist();
      }
    } catch {
      setMsg("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleRegenerar = async () => {
    setGerando(true);
    setMsg(null);
    try {
      const r = await regenerar({ data: { chave: num } });
      if (r.ok) {
        setVersaoAudio(Date.now().toString());
        setMsg("Locução gerada.");
        onChanged();
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
        setTexto(r.texto);
        setMsg("Texto gerado — revise e salve.");
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

  const downloadSrc = audioRegenSrc ?? audioEstatico;

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-medium text-foreground">
          <span className="text-accent">#{num}</span> {titulo}
        </h2>
        {override?.descricao && (
          <span className="text-xs text-muted-foreground">texto editado</span>
        )}
      </div>

      <Textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={6}
        className="mt-3"
        aria-label={`Texto da obra ${num}`}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={handleSalvar} disabled={salvando} className="min-h-11">
          {salvando ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          <span>Salvar texto</span>
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
          <Button asChild variant="outline" className="min-h-11">
            <a href={downloadSrc} download={`obra-${num}.mp3`}>
              <Download aria-hidden="true" />
              <span>Baixar áudio</span>
            </a>
          </Button>
        )}

        {msg && (
          <span className="text-sm text-muted-foreground" role="status">
            {msg}
          </span>
        )}
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
    </li>
  );
}
