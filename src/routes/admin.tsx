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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [vozGlobal, setVozGlobal] = useState<string>(VOZ_FEMININA_ID);
  const [tocandoAmostra, setTocandoAmostra] = useState(false);
  const [amostraMsg, setAmostraMsg] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return obras;
    return obras.filter(
      (o) =>
        String(o.num).includes(q) || o.titulo.toLowerCase().includes(q),
    );
  }, [busca]);

  const handleAmostra = async () => {
    setTocandoAmostra(true);
    setAmostraMsg(null);
    try {
      let url = cacheAmostras.get(vozGlobal);
      if (!url) {
        const r = await buscarAmostra({ data: { vozId: vozGlobal } });
        if (!r.ok || !r.url) {
          setAmostraMsg(
            r.ok ? "Esta voz não tem amostra." : (r.erro ?? "Erro na amostra."),
          );
          return;
        }
        url = r.url;
        cacheAmostras.set(vozGlobal, url);
      }
      await new Audio(url).play();
    } catch {
      setAmostraMsg("Não foi possível tocar a amostra.");
    } finally {
      setTocandoAmostra(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Administração de textos e áudios
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edite a descrição de cada obra e regenere o áudio. As mudanças ficam
          salvas e aparecem para os visitantes.
        </p>
      </header>

      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium text-foreground">Voz padrão</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Escolha a voz usada ao regenerar o áudio de todas as obras.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={vozGlobal} onValueChange={setVozGlobal}>
            <SelectTrigger className="min-h-11 w-60" aria-label="Voz padrão">
              <SelectValue placeholder="Voz" />
            </SelectTrigger>
            <SelectContent>
              {VOZES_PADRAO.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleAmostra}
            disabled={tocandoAmostra}
            className="min-h-11"
            aria-label="Ouvir amostra da voz padrão"
          >
            {tocandoAmostra ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Volume2 aria-hidden="true" />
            )}
            <span>Ouvir amostra</span>
          </Button>
          {amostraMsg && (
            <span className="text-sm text-muted-foreground" role="status">
              {amostraMsg}
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
            vozId={vozGlobal}
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
  vozId,
  onChanged,
}: {
  num: number;
  titulo: string;
  textoEstatico: string;
  audioEstatico: string | null;
  override: OverrideObra | undefined;
  vozId: string;
  onChanged: () => void;
}) {
  const salvar = useServerFn(salvarTexto);
  const regenerar = useServerFn(regenerarAudio);

  const [texto, setTexto] = useState(override?.descricao ?? textoEstatico);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [versaoAudio, setVersaoAudio] = useState<string | null>(
    override?.audioPath ? Date.now().toString() : null,
  );

  const protegida = num === OBRA_PROTEGIDA;
  const temAudioRegen = versaoAudio !== null;

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
      const r = await regenerar({ data: { chave: num, vozId } });
      if (r.ok) {
        setVersaoAudio(Date.now().toString());
        setMsg("Áudio regenerado.");
        onChanged();
      } else {
        setMsg(r.erro ?? "Erro ao regenerar.");
      }
    } catch {
      setMsg("Erro ao regenerar.");
    } finally {
      setGerando(false);
    }
  };

  const audioSrc = temAudioRegen
    ? `/api/public/obra-audio/${num}?v=${versaoAudio}`
    : null;

  const downloadSrc = audioSrc ?? audioEstatico;

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
            <span>Regenerar áudio</span>
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

      {audioSrc && (
        <audio controls preload="none" src={audioSrc} className="mt-3 w-full">
          Seu navegador não suporta áudio.
        </audio>
      )}
    </li>
  );
}
