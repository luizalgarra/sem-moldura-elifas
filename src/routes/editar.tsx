import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Save,
  RefreshCw,
  Search,
  Lock,
  Upload,
  ImageOff,
} from "lucide-react";
import { obras } from "@/data/obras";
import {
  listarOverrides,
  salvarDados,
  salvarImagem,
  regenerarAudio,
  type OverrideObra,
} from "@/lib/admin-obras.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const OBRA_PROTEGIDA = 2;

export const Route = createFileRoute("/editar")({
  head: () => ({
    meta: [
      { title: "Editar obras — Acervo Elifas Andreato" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditarPagina,
});

function EditarPagina() {
  const fetchOverrides = useServerFn(listarOverrides);
  const { data: overrides, refetch } = useQuery({
    queryKey: ["overrides-editar"],
    queryFn: () => fetchOverrides(),
  });

  const mapa = useMemo(() => {
    const m = new Map<number, OverrideObra>();
    (overrides ?? []).forEach((o) => m.set(o.num, o));
    return m;
  }, [overrides]);

  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return obras;
    return obras.filter(
      (o) => String(o.num).includes(q) || o.titulo.toLowerCase().includes(q),
    );
  }, [busca]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Editar obras
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Altere os dados, a descrição, a imagem e o áudio de cada obra. As
          mudanças ficam salvas e aparecem para os visitantes.
        </p>
      </header>

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
            obra={obra}
            override={mapa.get(obra.num)}
            onChanged={() => refetch()}
          />
        ))}
      </ul>
    </div>
  );
}

function ObraEditor({
  obra,
  override,
  onChanged,
}: {
  obra: (typeof obras)[number];
  override: OverrideObra | undefined;
  onChanged: () => void;
}) {
  const salvar = useServerFn(salvarDados);
  const enviarImagem = useServerFn(salvarImagem);
  const regenerar = useServerFn(regenerarAudio);
  const inputImagem = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState(override?.titulo ?? obra.titulo);
  const [ano, setAno] = useState(override?.ano ?? obra.ano);
  const [autor, setAutor] = useState(override?.autor ?? obra.autor);
  const [tecnica, setTecnica] = useState(override?.tecnica ?? obra.tecnica);
  const [dimensao, setDimensao] = useState(override?.dimensao ?? obra.dimensao);
  const [parede, setParede] = useState(override?.parede ?? obra.parede);
  const [descricao, setDescricao] = useState(
    override?.descricao ?? obra.descricao,
  );

  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [versaoImagem, setVersaoImagem] = useState<string | null>(
    override?.imagemPath ? Date.now().toString() : null,
  );
  const [versaoAudio, setVersaoAudio] = useState<string | null>(
    override?.audioPath ? Date.now().toString() : null,
  );

  const protegida = obra.num === OBRA_PROTEGIDA;

  const imagemSrc = versaoImagem
    ? `/api/public/obra-imagem/${obra.num}?v=${versaoImagem}`
    : obra.imagem;
  const audioSrc = versaoAudio
    ? `/api/public/obra-audio/${obra.num}?v=${versaoAudio}`
    : obra.audio;

  const handleSalvar = async () => {
    setSalvando(true);
    setMsg(null);
    try {
      const r = await salvar({
        data: {
          num: obra.num,
          titulo,
          ano,
          autor,
          tecnica,
          dimensao,
          parede,
          descricao,
        },
      });
      setMsg(r.ok ? "Dados salvos." : (r.erro ?? "Erro ao salvar."));
      if (r.ok) onChanged();
    } catch {
      setMsg("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setMsg("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 10_000_000) {
      setMsg("Imagem muito grande (máx. 10MB).");
      return;
    }

    setEnviando(true);
    setMsg(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("leitura"));
        reader.readAsDataURL(file);
      });
      const r = await enviarImagem({
        data: { num: obra.num, base64, contentType: file.type },
      });
      if (r.ok) {
        setVersaoImagem(r.versao);
        setMsg("Imagem atualizada.");
        onChanged();
      } else {
        setMsg(r.erro ?? "Erro ao enviar imagem.");
      }
    } catch {
      setMsg("Erro ao enviar imagem.");
    } finally {
      setEnviando(false);
    }
  };

  const handleRegenerar = async () => {
    setGerando(true);
    setMsg(null);
    try {
      const r = await regenerar({ data: { num: obra.num } });
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

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-medium text-foreground">
          <span className="text-primary">#{obra.num}</span> {obra.titulo}
        </h2>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <div className="sm:w-40 sm:shrink-0">
          <div className="aspect-square overflow-hidden rounded-md border border-border bg-muted">
            {imagemSrc ? (
              <img
                src={imagemSrc}
                alt={`Imagem atual da obra ${obra.num}`}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <ImageOff className="size-6" aria-hidden="true" />
                <span className="text-xs">Sem imagem</span>
              </div>
            )}
          </div>
          <input
            ref={inputImagem}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImagem}
          />
          <Button
            variant="outline"
            className="mt-2 w-full min-h-11"
            onClick={() => inputImagem.current?.click()}
            disabled={enviando}
          >
            {enviando ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Upload aria-hidden="true" />
            )}
            <span>Trocar imagem</span>
          </Button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo label="Título" value={titulo} onChange={setTitulo} />
          <Campo label="Ano" value={ano} onChange={setAno} />
          <Campo label="Autor" value={autor} onChange={setAutor} />
          <Campo label="Técnica" value={tecnica} onChange={setTecnica} />
          <Campo label="Dimensão" value={dimensao} onChange={setDimensao} />
          <Campo label="Parede" value={parede} onChange={setParede} />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor={`desc-${obra.num}`}>Descrição</Label>
        <Textarea
          id={`desc-${obra.num}`}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={6}
          className="mt-1"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={handleSalvar} disabled={salvando} className="min-h-11">
          {salvando ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          <span>Salvar dados</span>
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

function Campo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `${label}-${useMemo(() => Math.random().toString(36).slice(2), [])}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    </div>
  );
}
