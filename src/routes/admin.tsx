import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Save,
  RefreshCw,
  Search,
  Lock,
  Download,
  Volume2,
} from "lucide-react";
import { obras } from "@/data/obras";
import {
  listarOverrides,
  salvarTexto,
  regenerarAudio,
  amostraVoz,
  type OverrideObra,
} from "@/lib/admin-obras.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const OBRA_PROTEGIDA = 2;

// Vozes padrão oferecidas no admin (uma feminina, uma masculina).
const VOZ_FEMININA_ID = "7eUAxNOneHxqfyRS77mW"; // Carla (Conversacional)
const VOZ_MASCULINA_ID = "rVRk0uJAtO8T38Gm03mf"; // Danilo Tenfen
const VOZES_PADRAO = [
  { id: VOZ_FEMININA_ID, rotulo: "Carla (feminina)" },
  { id: VOZ_MASCULINA_ID, rotulo: "Danilo Tenfen (masculina)" },
];

// Cache de URLs de amostra por voz, compartilhado entre os itens.
const cacheAmostras = new Map<string, string>();

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
  const buscarAmostra = useServerFn(amostraVoz);
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
  const [amostraCarregando, setAmostraCarregando] = useState<string | null>(null);
  const [amostraMsg, setAmostraMsg] = useState<string | null>(null);

  // Geração em lote (todas as obras).
  const regenerar = useServerFn(regenerarAudio);
  const [loteRodando, setLoteRodando] = useState(false);
  const [loteFeito, setLoteFeito] = useState(0);
  const [loteMsg, setLoteMsg] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return obras;
    return obras.filter(
      (o) =>
        String(o.num).includes(q) || o.titulo.toLowerCase().includes(q),
    );
  }, [busca]);

  const handleAmostra = async (vozId: string) => {
    setAmostraCarregando(vozId);
    setAmostraMsg(null);
    try {
      let url = cacheAmostras.get(vozId);
      if (!url) {
        const r = await buscarAmostra({ data: { vozId } });
        if (!r.ok || !r.url) {
          setAmostraMsg(
            r.ok ? "Esta voz não tem amostra." : (r.erro ?? "Erro na amostra."),
          );
          return;
        }
        url = r.url;
        cacheAmostras.set(vozId, url);
      }
      await new Audio(url).play();
    } catch {
      setAmostraMsg("Não foi possível tocar a amostra.");
    } finally {
      setAmostraCarregando(null);
    }
  };

  const handleLote = async () => {
    const alvos = obras.filter((o) => o.num !== OBRA_PROTEGIDA);
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
        ? `Pronto! ${alvos.length} obras geradas com as duas vozes.`
        : `Concluído com ${falhas} falha(s) de ${alvos.length}.`,
    );
    refetch();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Administração de textos e áudios
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edite a descrição de cada obra e gere o áudio. Cada obra é gerada com
          as duas vozes padrão (feminina e masculina).
        </p>
      </header>

      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium text-foreground">Vozes padrão</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Cada obra recebe as duas locuções. Ouça as amostras abaixo.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {VOZES_PADRAO.map((v) => (
            <div key={v.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-foreground">{v.rotulo}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAmostra(v.id)}
                disabled={amostraCarregando === v.id}
                className="min-h-11 min-w-11"
                aria-label={`Ouvir amostra de ${v.rotulo}`}
              >
                {amostraCarregando === v.id ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Volume2 aria-hidden="true" />
                )}
              </Button>
            </div>
          ))}
        </div>
        {amostraMsg && (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            {amostraMsg}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
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
            <span>Gerar áudios de todas as obras (Carla + Danilo)</span>
          </Button>
          {loteRodando && (
            <span className="text-sm text-muted-foreground" role="status">
              Gerando… {loteFeito}/{obras.filter((o) => o.num !== OBRA_PROTEGIDA).length}
            </span>
          )}
          {!loteRodando && loteMsg && (
            <span className="text-sm text-muted-foreground" role="status">
              {loteMsg}
            </span>
          )}
        </div>
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

  const [texto, setTexto] = useState(override?.descricao ?? textoEstatico);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [versaoAudio, setVersaoAudio] = useState<string | null>(
    override?.audioTrechos && override.audioTrechos.length > 0
      ? Date.now().toString()
      : null,
  );

  const protegida = num === OBRA_PROTEGIDA;
  const trechos = override?.audioTrechos ?? [];
  const temAudioRegen = versaoAudio !== null && trechos.length > 0;

  const handleSalvar = async () => {
    setSalvando(true);
    setMsg(null);
    try {
      const r = await salvar({ data: { chave: num, descricao: texto } });
      setMsg(r.ok ? "Texto salvo." : (r.erro ?? "Erro ao salvar."));
      if (r.ok) onChanged();
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
        setMsg(`Locução alternada gerada (${r.trechos} trechos).`);
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

  // Áudio protegido (#2): mantém o arquivo único legado para conferência.
  const audioProtegidoSrc =
    protegida && (override?.audioPath || audioEstatico)
      ? `/api/public/obra-audio/${num}?v=${versaoAudio ?? Date.now()}`
      : null;

  const downloadSrc =
    (temAudioRegen ? `/api/public/obra-audio/${num}?trecho=0&v=${versaoAudio}` : null) ??
    audioProtegidoSrc ??
    audioEstatico;

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

        {protegida ? (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Lock className="size-4" aria-hidden="true" />
            Áudio especial preservado
          </span>
        ) : (
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
            <span>Gerar áudios (Carla + Danilo)</span>
          </Button>
        )}

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

      {protegida && audioSrc && (
        <audio controls preload="none" src={audioSrc} className="mt-3 w-full">
          Seu navegador não suporta áudio.
        </audio>
      )}

      {!protegida && temAudioRegen && (
        <div className="mt-3 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Voz feminina (Carla)</p>
            <audio controls preload="none" src={audioFemSrc!} className="mt-1 w-full">
              Seu navegador não suporta áudio.
            </audio>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Voz masculina (Danilo Tenfen)
            </p>
            <audio controls preload="none" src={audioMascSrc!} className="mt-1 w-full">
              Seu navegador não suporta áudio.
            </audio>
          </div>
        </div>
      )}
    </li>
  );
}
