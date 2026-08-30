import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

import { clienteRede } from "@/lib/rede-backend";

export const Route = createFileRoute("/guardiao")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Guardião da Rede" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Painel interno da Rede Além da Moldura." },
      { property: "og:title", content: "Guardião da Rede" },
      { property: "og:description", content: "Painel interno da Rede Além da Moldura." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Guardiao,
});

type Linha = Record<string, unknown>;

const FILTROS = [
  { chave: "decidir", rotulo: "A decidir" },
  { chave: "rede", rotulo: "Na Rede" },
  { chave: "recusados", rotulo: "Recusados" },
  { chave: "todos", rotulo: "Todos" },
] as const;

type Filtro = (typeof FILTROS)[number]["chave"];

const STATUS_DECIDIR = ["etapa_a_completa", "completo", "ficha_aprovada"];

function txt(linha: Linha | null, ...chaves: string[]): string {
  if (!linha) return "";
  for (const c of chaves) {
    const v = linha[c];
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "number") return String(v);
  }
  return "";
}

function num(linha: Linha | null, ...chaves: string[]): number {
  if (!linha) return 0;
  for (const c of chaves) {
    const v = linha[c];
    if (typeof v === "number") return v;
    if (Array.isArray(v)) return v.length;
  }
  return 0;
}

function bool(linha: Linha | null, ...chaves: string[]): boolean {
  if (!linha) return false;
  return chaves.some((c) => linha[c] === true);
}

function data(valor: string): string {
  if (!valor) return "";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
}

/* ---------------- página ---------------- */

function Guardiao() {
  const supabase = useMemo(() => clienteRede(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setCarregandoSessao(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (carregandoSessao) {
    return (
      <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-20 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
      </div>
    );
  }

  if (!session) return <Entrada />;

  return <Painel email={session.user.email ?? ""} />;
}

function Entrada() {
  const supabase = useMemo(() => clienteRede(), []);
  const [estado, setEstado] = useState<"aberto" | "enviando" | "enviado">("aberto");
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setEstado("enviando");
    setErro(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/guardiao` },
    });
    if (error) {
      setErro(error.message);
      setEstado("aberto");
      return;
    }
    setEstado("enviado");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-serif text-2xl font-bold text-foreground">Guardião da Rede</h1>
      {estado === "enviado" ? (
        <p className="mt-4 text-muted-foreground">
          Enviamos um link de acesso para o seu e-mail. Abra por ele para entrar.
        </p>
      ) : (
        <form onSubmit={enviar} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="font-medium text-foreground">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-foreground focus-visible:border-accent focus-visible:outline-none"
            />
          </div>
          {erro && (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={estado === "enviando"}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {estado === "enviando" && <Loader2 className="size-4 animate-spin" />}
            Receber link de acesso
          </button>
        </form>
      )}
    </div>
  );
}

function Painel({ email }: { email: string }) {
  const supabase = useMemo(() => clienteRede(), []);
  const [filtro, setFiltro] = useState<Filtro>("decidir");
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<Linha | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data: d, error } = await supabase.from("fila_guardiao").select("*");
    if (error) setErro(error.message);
    else {
      setErro(null);
      setLinhas((d ?? []) as Linha[]);
    }
    setCarregando(false);
  }, [supabase]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const visiveis = linhas.filter((l) => {
    const status = txt(l, "status");
    if (filtro === "decidir") return STATUS_DECIDIR.includes(status);
    if (filtro === "rede") return status === "aprovado";
    if (filtro === "recusados") return status === "recusado";
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold text-foreground">Guardião da Rede</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{email}</span>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="underline underline-offset-2"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.chave}
            type="button"
            onClick={() => setFiltro(f.chave)}
            className={
              "min-h-[36px] rounded-full border px-4 text-sm transition-colors " +
              (filtro === f.chave
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:bg-secondary")
            }
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {erro && (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {erro}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="space-y-3">
          {carregando && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Carregando…
            </p>
          )}
          {!carregando && visiveis.length === 0 && (
            <p className="text-muted-foreground">Nada por aqui.</p>
          )}
          {visiveis.map((l, i) => (
            <Cartao
              key={txt(l, "id", "membro_id") || i}
              linha={l}
              ativo={txt(selecionado, "id", "membro_id") === txt(l, "id", "membro_id")}
              aoSelecionar={() => setSelecionado(l)}
            />
          ))}
        </div>

        <div>
          {selecionado ? (
            <Detalhe
              key={txt(selecionado, "id", "membro_id")}
              linha={selecionado}
              email={email}
              aoDecidir={carregar}
            />
          ) : (
            <p className="text-muted-foreground">
              Escolha alguém na lista para ler a ficha.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Selo({
  children,
  tom = "neutro",
}: {
  children: React.ReactNode;
  tom?: "neutro" | "atencao" | "forte";
}) {
  const cor =
    tom === "atencao"
      ? "border-accent/60 bg-accent/15 text-accent"
      : tom === "forte"
        ? "border-destructive/60 bg-destructive/15 text-destructive"
        : "border-border bg-secondary text-muted-foreground";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${cor}`}>{children}</span>
  );
}

function Cartao({
  linha,
  ativo,
  aoSelecionar,
}: {
  linha: Linha;
  ativo: boolean;
  aoSelecionar: () => void;
}) {
  const noAcervo = num(linha, "itens_acervo", "acervo_total", "acervo_declarado");
  const revisar = num(linha, "itens_revisar", "acervo_revisar");
  const recusas = num(linha, "recusas", "total_recusas", "dispensas");

  return (
    <button
      type="button"
      onClick={aoSelecionar}
      className={
        "w-full rounded-lg border p-4 text-left transition-colors " +
        (ativo ? "border-accent bg-secondary/60" : "border-border hover:bg-secondary/40")
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-foreground">
          {txt(linha, "nome", "nome_completo") || "Sem nome"}
        </span>
        <span className="text-xs text-muted-foreground">
          {data(txt(linha, "criado_em", "created_at", "atualizado_em"))}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {txt(linha, "cidade", "municipio") || "—"}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Selo>{noAcervo > 0 ? `${noAcervo} no acervo` : "sem acervo"}</Selo>
        {bool(linha, "aceita_estrela") && <Selo>aceita estrela</Selo>}
        {bool(linha, "espera_renda") && <Selo tom="atencao">espera renda</Selo>}
        {revisar > 0 && <Selo tom="atencao">{revisar} a revisar</Selo>}
        {recusas > 0 && (
          <Selo>
            {recusas} recusa{recusas > 1 ? "s" : ""}
          </Selo>
        )}
      </div>
    </button>
  );
}

function Detalhe({
  linha,
  email,
  aoDecidir,
}: {
  linha: Linha;
  email: string;
  aoDecidir: () => void;
}) {
  const supabase = useMemo(() => clienteRede(), []);
  const id = txt(linha, "id", "membro_id");
  const [acervo, setAcervo] = useState<Linha[]>([]);
  const [ofertas, setOfertas] = useState<Linha[]>([]);
  const [respostas, setRespostas] = useState<Linha[]>([]);
  const [mensagens, setMensagens] = useState<Linha[]>([]);
  const [observacao, setObservacao] = useState(txt(linha, "observacao_guardiao"));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const [a, o, r, c] = await Promise.all([
        supabase.from("acervo_declarado").select("*").eq("membro_id", id),
        supabase.from("ofertas").select("*").eq("membro_id", id),
        supabase.from("respostas").select("*").eq("membro_id", id),
        supabase.from("conversas").select("id").eq("membro_id", id),
      ]);
      setAcervo((a.data ?? []) as Linha[]);
      setOfertas((o.data ?? []) as Linha[]);
      setRespostas((r.data ?? []) as Linha[]);

      const ids = ((c.data ?? []) as Linha[]).map((x) => txt(x, "id")).filter(Boolean);
      if (ids.length) {
        const m = await supabase
          .from("mensagens")
          .select("*")
          .in("conversa_id", ids)
          .order("criado_em", { ascending: true });
        setMensagens((m.data ?? []) as Linha[]);
      } else {
        setMensagens([]);
      }
    })();
  }, [id, supabase]);

  async function decidir(admitir: boolean) {
    setSalvando(true);
    setErro(null);
    const { error } = await supabase
      .from("membros")
      .update({
        status: admitir ? "aprovado" : "recusado",
        estagio_escada: admitir ? 2 : 0,
        revisado_por: email,
        revisado_em: new Date().toISOString(),
        observacao_guardiao: observacao,
      })
      .eq("id", id);
    setSalvando(false);
    if (error) setErro(error.message);
    else aoDecidir();
  }

  const contou = respostas.filter((r) => txt(r, "bloco") !== "dispensa");
  const dispensou = respostas.filter((r) => txt(r, "bloco") === "dispensa");
  const fichaAprovada = txt(linha, "ficha_aprovada_em");

  return (
    <article className="rounded-lg border border-border p-6">
      <h2 className="font-serif text-2xl font-bold text-foreground">
        {txt(linha, "nome", "nome_completo") || "Sem nome"}
      </h2>
      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <Par termo="Contato" valor={txt(linha, "email", "contato")} />
        <Par termo="Cidade" valor={txt(linha, "cidade", "municipio")} />
        <Par termo="Vínculo" valor={txt(linha, "vinculo", "vinculo_texto")} />
        <Par termo="Espera" valor={txt(linha, "expectativa", "o_que_espera", "espera")} />
        <Par termo="Aceita estrela" valor={bool(linha, "aceita_estrela") ? "sim" : "não"} />
        <Par termo="Status" valor={txt(linha, "status")} />
      </dl>

      <section className="mt-6 rounded-lg border border-accent/40 bg-secondary/40 p-5">
        <h3 className="text-xs tracking-[0.16em] text-accent uppercase">Ficha</h3>
        <p className="mt-3 font-serif text-lg leading-relaxed whitespace-pre-wrap text-foreground">
          {txt(linha, "ficha_texto") || "Ainda sem ficha."}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {fichaAprovada
            ? `Aprovada pela própria pessoa em ${data(fichaAprovada)}.`
            : "Ainda não aprovada pela própria pessoa."}
        </p>
      </section>

      <Bloco titulo="Acervo declarado" vazio="Nada declarado.">
        {acervo.map((item, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2">
            <span className="text-foreground">
              {txt(item, "descricao", "titulo", "item") || "item"}
            </span>
            {txt(item, "confianca") === "revisar" && <Selo tom="atencao">genérico</Selo>}
            {bool(item, "direitos_terceiros") && (
              <Selo tom="forte">direitos de terceiros</Selo>
            )}
          </li>
        ))}
      </Bloco>

      <Bloco titulo="Ofertas" vazio="Nenhuma oferta.">
        {ofertas.map((o, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2">
            <span className="text-foreground">
              {txt(o, "descricao", "titulo", "oferta") || "oferta"}
            </span>
            {bool(o, "aceita_estrela") && <Selo>aceita estrela</Selo>}
          </li>
        ))}
      </Bloco>

      <Bloco titulo="O que a pessoa contou" vazio="Nada registrado.">
        {contou.map((r, i) => (
          <li key={i}>
            <span className="text-xs text-muted-foreground">{txt(r, "bloco")}</span>
            <p className="whitespace-pre-wrap text-foreground">{txt(r, "texto", "valor")}</p>
          </li>
        ))}
      </Bloco>

      {dispensou.length > 0 && (
        <Bloco titulo="Preferiu não responder" vazio="">
          {dispensou.map((r, i) => (
            <li key={i} className="text-muted-foreground">
              {txt(r, "texto", "valor", "pergunta")}
            </li>
          ))}
        </Bloco>
      )}

      <details className="mt-6 rounded-lg border border-border p-4">
        <summary className="cursor-pointer text-foreground">A conversa inteira</summary>
        <div className="mt-4 space-y-3">
          {mensagens.length === 0 && <p className="text-muted-foreground">Sem mensagens.</p>}
          {mensagens.map((m, i) => (
            <div key={i}>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                {txt(m, "papel", "autor", "de")}
              </p>
              <p className="whitespace-pre-wrap text-foreground">
                {txt(m, "texto", "conteudo")}
              </p>
            </div>
          ))}
        </div>
      </details>

      <section className="mt-8">
        <label htmlFor="obs" className="font-medium text-foreground">
          Observação do Guardião
        </label>
        <textarea
          id="obs"
          rows={3}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-foreground focus-visible:border-accent focus-visible:outline-none"
        />
        {erro && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {erro}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={salvando}
            onClick={() => decidir(true)}
            className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            Admitir na Rede
          </button>
          <button
            type="button"
            disabled={salvando}
            onClick={() => decidir(false)}
            className="inline-flex min-h-[44px] items-center rounded-md border border-destructive px-5 font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
          >
            Recusar
          </button>
        </div>
      </section>
    </article>
  );
}

function Par({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{termo}</dt>
      <dd className="text-foreground">{valor || "—"}</dd>
    </div>
  );
}

function Bloco({
  titulo,
  vazio,
  children,
}: {
  titulo: string;
  vazio: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="mt-6">
      <h3 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{titulo}</h3>
      {children.length === 0 ? (
        vazio && <p className="mt-2 text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="mt-2 space-y-2">{children}</ul>
      )}
    </section>
  );
}
