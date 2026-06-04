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
  Plus,
  Trash2,
} from "lucide-react";
import {
  listarAcervo,
  criarObra,
  removerObra,
  salvarDados,
  salvarImagem,
  regenerarAudio,
  type ObraAcervo,
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
  const fetchAcervo = useServerFn(listarAcervo);
  const { data: acervo, refetch } = useQuery({
    queryKey: ["acervo-editar"],
    queryFn: () => fetchAcervo(),
  });

  const [busca, setBusca] = useState("");
  const [paredeFiltro, setParedeFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "fixa" | "nova">(
    "todos",
  );
  const [imagemFiltro, setImagemFiltro] = useState<"todos" | "com" | "sem">(
    "todos",
  );
  const [audioFiltro, setAudioFiltro] = useState<"todos" | "com" | "sem">(
    "todos",
  );
  const [descricaoFiltro, setDescricaoFiltro] = useState<
    "todos" | "com" | "sem"
  >("todos");
  const [tamanhoFiltro, setTamanhoFiltro] = useState<
    "todos" | "curta" | "longa"
  >("todos");

  const paredes = useMemo(() => {
    const set = new Set<string>();
    for (const o of acervo ?? []) {
      if (o.parede?.trim()) set.add(o.parede.trim());
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, "pt-BR", { numeric: true }),
    );
  }, [acervo]);

  const filtrosAtivos =
    busca.trim() !== "" ||
    paredeFiltro !== "" ||
    tipoFiltro !== "todos" ||
    imagemFiltro !== "todos" ||
    audioFiltro !== "todos" ||
    descricaoFiltro !== "todos" ||
    tamanhoFiltro !== "todos";

  const limparFiltros = () => {
    setBusca("");
    setParedeFiltro("");
    setTipoFiltro("todos");
    setImagemFiltro("todos");
    setAudioFiltro("todos");
    setDescricaoFiltro("todos");
    setTamanhoFiltro("todos");
  };

  const filtradas = useMemo(() => {
    let lista = acervo ?? [];
    const q = busca.trim().toLowerCase();
    if (q) {
      lista = lista.filter(
        (o) => String(o.num).includes(q) || o.titulo.toLowerCase().includes(q),
      );
    }
    if (paredeFiltro) {
      lista = lista.filter((o) => (o.parede?.trim() ?? "") === paredeFiltro);
    }
    if (tipoFiltro !== "todos") {
      lista = lista.filter((o) =>
        tipoFiltro === "nova" ? o.extra : !o.extra,
      );
    }
    if (imagemFiltro !== "todos") {
      lista = lista.filter((o) =>
        imagemFiltro === "com" ? !!o.imagem : !o.imagem,
      );
    }
    if (audioFiltro !== "todos") {
      lista = lista.filter((o) =>
        audioFiltro === "com" ? !!o.audio : !o.audio,
      );
    }
    if (descricaoFiltro !== "todos") {
      lista = lista.filter((o) =>
        descricaoFiltro === "com"
          ? !!o.descricao?.trim()
          : !o.descricao?.trim(),
      );
    }
    if (tamanhoFiltro !== "todos") {
      lista = lista.filter((o) => {
        const len = o.descricao?.trim().length ?? 0;
        if (len === 0) return false;
        return tamanhoFiltro === "curta" ? len <= 300 : len > 300;
      });
    }
    return lista;
  }, [
    acervo,
    busca,
    paredeFiltro,
    tipoFiltro,
    imagemFiltro,
    audioFiltro,
    descricaoFiltro,
    tamanhoFiltro,
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Editar obras
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inclua, edite ou remova obras. Altere os dados, a descrição, a imagem
          e o áudio. As mudanças aparecem para os visitantes.
        </p>
      </header>

      <NovaObra onCriada={() => refetch()} />

      <div className="sticky top-0 z-10 -mx-4 mt-6 space-y-3 bg-background/95 px-4 py-3 backdrop-blur">
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Parede
            </span>
            <select
              value={paredeFiltro}
              onChange={(e) => setParedeFiltro(e.target.value)}
              aria-label="Filtrar por parede"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            >
              <option value="">Todas</option>
              {paredes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <FiltroTri
            rotulo="Tipo"
            valor={tipoFiltro}
            onChange={setTipoFiltro}
            opcoes={[
              { valor: "todos", texto: "Todos" },
              { valor: "fixa", texto: "Fixas" },
              { valor: "nova", texto: "Novas" },
            ]}
          />
          <FiltroTri
            rotulo="Imagem"
            valor={imagemFiltro}
            onChange={setImagemFiltro}
            opcoes={[
              { valor: "todos", texto: "Todas" },
              { valor: "com", texto: "Com" },
              { valor: "sem", texto: "Sem" },
            ]}
          />
          <FiltroTri
            rotulo="Áudio"
            valor={audioFiltro}
            onChange={setAudioFiltro}
            opcoes={[
              { valor: "todos", texto: "Todos" },
              { valor: "com", texto: "Com" },
              { valor: "sem", texto: "Sem" },
            ]}
          />
          <FiltroTri
            rotulo="Descrição"
            valor={descricaoFiltro}
            onChange={setDescricaoFiltro}
            opcoes={[
              { valor: "todos", texto: "Todas" },
              { valor: "com", texto: "Com" },
              { valor: "sem", texto: "Sem" },
            ]}
          />
          <FiltroTri
            rotulo="Tamanho"
            valor={tamanhoFiltro}
            onChange={setTamanhoFiltro}
            opcoes={[
              { valor: "todos", texto: "Todas" },
              { valor: "curta", texto: "Curta" },
              { valor: "longa", texto: "Longa" },
            ]}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {filtradas.length}{" "}
            {filtradas.length === 1 ? "resultado" : "resultados"}
          </span>
          {filtrosAtivos && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={limparFiltros}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      <ul className="mt-4 space-y-4">
        {filtradas.map((obra) => (
          <ObraEditor
            key={obra.chave}
            obra={obra}
            onChanged={() => refetch()}
          />

        ))}
      </ul>
    </div>
  );
}

function FiltroTri<T extends string>({
  rotulo,
  valor,
  onChange,
  opcoes,
}: {
  rotulo: string;
  valor: T;
  onChange: (v: T) => void;
  opcoes: { valor: T; texto: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        {rotulo}
      </span>
      <div className="inline-flex overflow-hidden rounded-md border border-input">
        {opcoes.map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => onChange(op.valor)}
            aria-pressed={valor === op.valor}
            className={
              "px-2 py-1 text-xs transition-colors " +
              (valor === op.valor
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted")
            }
          >
            {op.texto}
          </button>
        ))}
      </div>
    </div>
  );
}



function NovaObra({ onCriada }: { onCriada: () => void }) {
  const criar = useServerFn(criarObra);
  const enviarImagem = useServerFn(salvarImagem);
  const inputImagem = useRef<HTMLInputElement>(null);

  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState("");
  const [titulo, setTitulo] = useState("");
  const [ano, setAno] = useState("");
  const [autor, setAutor] = useState("Elifas Andreato");
  const [tecnica, setTecnica] = useState("");
  const [dimensao, setDimensao] = useState("");
  const [parede, setParede] = useState("Parede 4");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const limpar = () => {
    setPosicao("");
    setTitulo("");
    setAno("");
    setAutor("Elifas Andreato");
    setTecnica("");
    setDimensao("");
    setParede("Parede 4");
    setDescricao("");
    setArquivo(null);
  };


  const lerBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("leitura"));
      reader.readAsDataURL(file);
    });

  const handleCriar = async () => {
    const p = Number(posicao);
    if (!Number.isInteger(p) || p < 1) {
      setMsg("Informe a posição (número de exibição) da obra.");
      return;
    }
    if (!titulo.trim()) {
      setMsg("Informe o título da obra.");
      return;
    }
    if (arquivo && !/^image\/(jpeg|png|webp)$/.test(arquivo.type)) {
      setMsg("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (arquivo && arquivo.size > 10_000_000) {
      setMsg("Imagem muito grande (máx. 10MB).");
      return;
    }

    setSalvando(true);
    setMsg(null);
    try {
      const r = await criar({
        data: {
          posicao: p,
          titulo,
          ano,
          autor,
          tecnica,
          dimensao,
          parede,
          descricao,
        },
      });
      if (!r.ok) {
        setMsg(r.erro ?? "Não foi possível criar a obra.");
        return;
      }
      if (arquivo) {
        const base64 = await lerBase64(arquivo);
        await enviarImagem({
          data: { chave: r.chave, base64, contentType: arquivo.type },
        });
      }
      setMsg("Obra criada.");
      limpar();
      setAberto(false);
      onCriada();
    } catch {
      setMsg("Não foi possível criar a obra.");
    } finally {
      setSalvando(false);
    }
  };


  if (!aberto) {
    return (
      <div className="mt-6">
        <Button onClick={() => setAberto(true)} className="min-h-11">
          <Plus aria-hidden="true" />
          <span>Incluir nova obra</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-primary/40 bg-card p-4">
      <h2 className="font-serif text-lg font-semibold text-foreground">
        Nova obra
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="nova-posicao">Posição na sequência</Label>
          <Input
            id="nova-posicao"
            inputMode="numeric"
            value={posicao}
            onChange={(e) => setPosicao(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Ex.: 5 (entra como nº 5)"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            As obras desta posição em diante sobem um número.
          </p>
        </div>

        <div>
          <Label htmlFor="nova-titulo">Título</Label>
          <Input
            id="nova-titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="nova-ano">Ano</Label>
          <Input
            id="nova-ano"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="nova-autor">Autor</Label>
          <Input
            id="nova-autor"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="nova-tecnica">Técnica</Label>
          <Input
            id="nova-tecnica"
            value={tecnica}
            onChange={(e) => setTecnica(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="nova-dimensao">Dimensão</Label>
          <Input
            id="nova-dimensao"
            value={dimensao}
            onChange={(e) => setDimensao(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="nova-parede">Parede</Label>
          <Input
            id="nova-parede"
            value={parede}
            onChange={(e) => setParede(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="nova-imagem">Imagem</Label>
          <input
            id="nova-imagem"
            ref={inputImagem}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-1 w-full min-h-11"
            onClick={() => inputImagem.current?.click()}
          >
            <Upload aria-hidden="true" />
            <span className="truncate">
              {arquivo ? arquivo.name : "Escolher imagem"}
            </span>
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <Label htmlFor="nova-descricao">Descrição</Label>
        <Textarea
          id="nova-descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={5}
          className="mt-1"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={handleCriar} disabled={salvando} className="min-h-11">
          {salvando ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Plus aria-hidden="true" />
          )}
          <span>Criar obra</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          onClick={() => {
            setAberto(false);
            setMsg(null);
          }}
          disabled={salvando}
        >
          Cancelar
        </Button>
        {msg && (
          <span className="text-sm text-muted-foreground" role="status">
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}

function ObraEditor({
  obra,
  onChanged,
}: {
  obra: ObraAcervo;
  onChanged: () => void;
}) {
  const salvar = useServerFn(salvarDados);
  const enviarImagem = useServerFn(salvarImagem);
  const regenerar = useServerFn(regenerarAudio);
  const remover = useServerFn(removerObra);
  const inputImagem = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState(obra.titulo);
  const [ano, setAno] = useState(obra.ano);
  const [autor, setAutor] = useState(obra.autor);
  const [tecnica, setTecnica] = useState(obra.tecnica);
  const [dimensao, setDimensao] = useState(obra.dimensao);
  const [parede, setParede] = useState(obra.parede);
  const [descricao, setDescricao] = useState(obra.descricao);

  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [imagemUrl, setImagemUrl] = useState<string | null>(obra.imagem);
  const [audioUrl, setAudioUrl] = useState<string | null>(obra.audio);

  const protegida = obra.chave === OBRA_PROTEGIDA;

  const handleSalvar = async () => {
    setSalvando(true);
    setMsg(null);
    try {
      const r = await salvar({
        data: {
          chave: obra.chave,
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
        data: { chave: obra.chave, base64, contentType: file.type },
      });
      if (r.ok) {
        setImagemUrl(`/api/public/obra-imagem/${obra.chave}?v=${r.versao}`);
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
      const r = await regenerar({ data: { chave: obra.chave } });
      if (r.ok) {
        setAudioUrl(`/api/public/obra-audio/${obra.chave}?v=${r.versao}`);
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

  const handleRemover = async () => {
    const aviso = obra.extra
      ? `Apagar de vez a obra #${obra.num} “${obra.titulo}”? Esta ação não pode ser desfeita.`
      : `Remover a obra #${obra.num} “${obra.titulo}” do site? Ela deixará de aparecer para os visitantes.`;
    if (!window.confirm(aviso)) return;

    setRemovendo(true);
    setMsg(null);
    try {
      const r = await remover({ data: { chave: obra.chave } });
      if (r.ok) {
        onChanged();
      } else {
        setMsg(r.erro ?? "Erro ao remover.");
        setRemovendo(false);
      }
    } catch {
      setMsg("Erro ao remover.");
      setRemovendo(false);
    }
  };

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-medium text-foreground">
          <span className="text-primary">#{obra.num}</span> {obra.titulo}
          {obra.extra && (
            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              Nova
            </span>
          )}
        </h2>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <div className="sm:w-40 sm:shrink-0">
          <div className="aspect-square overflow-hidden rounded-md border border-border bg-muted">
            {imagemUrl ? (
              <img
                src={imagemUrl}
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
            onClick={handleRegenerar}
            disabled={gerando}
            className="min-h-11 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {gerando ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw aria-hidden="true" />
            )}
            <span>Regenerar áudio</span>
          </Button>
        )}

        <Button
          variant="destructive"
          onClick={handleRemover}
          disabled={removendo}
          className="min-h-11"
        >
          {removendo ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 aria-hidden="true" />
          )}
          <span>{obra.extra ? "Apagar" : "Remover"}</span>
        </Button>

        {msg && (
          <span className="text-sm text-muted-foreground" role="status">
            {msg}
          </span>
        )}
      </div>

      {audioUrl && (
        <audio controls preload="none" src={audioUrl} className="mt-3 w-full">
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
