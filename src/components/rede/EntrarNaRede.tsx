import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  chamarRede,
  redeConfigurada,
  type RespostaConversa,
  type RespostaInscrever,
} from "@/lib/rede-backend";
import { Conversa, guardarSessao, lerSessao, type Turno } from "@/components/rede/Conversa";

type EstadoConversa = {
  conversaId: string;
  sessao: string;
  turnos: Turno[];
  faltam: number;
  ferramentas: string[];
};

const CAMPO =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-foreground " +
  "placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:outline-none";

export function EntrarNaRede() {
  const [conversa, setConversa] = useState<EstadoConversa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroRetomada, setErroRetomada] = useState<string | null>(null);
  const iniciado = useRef(false);

  // Estado C (retomada por token) e recuperação de refresh acidental.
  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("t");

    if (!token) {
      const salvo = lerSessao();
      if (salvo) {
        setConversa({
          conversaId: salvo.conversa_id,
          sessao: salvo.sessao,
          turnos: [],
          faltam: 1,
          ferramentas: [],
        });
      }
      setCarregando(false);
      return;
    }

    void (async () => {
      try {
        const r = await chamarRede<RespostaConversa>("rede-conversa", {
          action: "retomar",
          token,
        });
        guardarSessao(r.conversa_id, r.sessao);
        setConversa({
          conversaId: r.conversa_id,
          sessao: r.sessao,
          turnos: [{ de: "anfitriao", texto: r.mensagem }],
          faltam: r.faltam?.length ?? 1,
          ferramentas: r.ferramentas ?? [],
        });
      } catch (e) {
        setErroRetomada(e instanceof Error ? e.message : "Não foi possível retomar.");
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  if (carregando) {
    return (
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-16 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Abrindo a conversa…
      </div>
    );
  }

  if (erroRetomada) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p role="alert" className="text-destructive">
          {erroRetomada}
        </p>
        <p className="mt-3 text-muted-foreground">
          Peça um novo link ao Guardião da Rede para continuar de onde você parou.
        </p>
      </div>
    );
  }

  if (conversa) {
    return (
      <Conversa
        conversaId={conversa.conversaId}
        sessao={conversa.sessao}
        turnosIniciais={conversa.turnos}
        faltamIniciais={conversa.faltam}
        ferramentasIniciais={conversa.ferramentas}
      />
    );
  }

  return <Formulario aoAbrir={setConversa} />;
}

function Formulario({ aoAbrir }: { aoAbrir: (estado: EstadoConversa) => void }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErro(null);
    try {
      const origem = new URLSearchParams(window.location.search).get("origem") || "site";

      const inscricao = await chamarRede<RespostaInscrever>("rede-inscrever", {
        nome: String(form.get("nome") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        vinculo: String(form.get("vinculo") ?? "").trim(),
        origem,
      });

      const aberta = await chamarRede<RespostaConversa>("rede-conversa", {
        action: "abrir",
        lista_espera_id: inscricao.lista_espera_id,
        email: inscricao.email,
        base_url: window.location.origin,
      });

      guardarSessao(aberta.conversa_id, aberta.sessao);
      aoAbrir({
        conversaId: aberta.conversa_id,
        sessao: aberta.sessao,
        turnos: [{ de: "anfitriao", texto: aberta.mensagem }],
        faltam: aberta.faltam?.length ?? 1,
        ferramentas: aberta.ferramentas ?? [],
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível começar agora.");
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="font-semibold tracking-[0.18em] text-accent uppercase">
        Rede Além da Moldura
      </p>
      <h1 className="mt-3 font-serif text-3xl leading-tight font-bold text-foreground sm:text-5xl">
        Entrar na Rede
      </h1>

      <div className="mt-5 space-y-4 text-lg text-muted-foreground">
        <p>
          Entrar aqui não é preencher ficha. São duas perguntas e, logo depois, uma conversa
          curta — com alguém do outro lado genuinamente interessado no que só você sabe sobre
          a obra do Elifas.
        </p>
        <p>Leva poucos minutos e você escreve do seu jeito.</p>
      </div>

      {!redeConfigurada && (
        <p role="alert" className="mt-6 text-sm text-destructive">
          A chave publicável do back-end da Rede ainda não foi configurada.
        </p>
      )}

      <form onSubmit={enviar} className="mt-10 space-y-5">
        <div>
          <label htmlFor="nome" className="font-medium text-foreground">
            Nome <span aria-hidden="true">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            required
            maxLength={120}
            autoComplete="name"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="email" className="font-medium text-foreground">
            E-mail <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            inputMode="email"
            aria-describedby="email-ajuda"
            className={CAMPO}
          />
          <p id="email-ajuda" className="mt-1.5 text-sm text-muted-foreground">
            É por aqui que o convite para a roda chega.
          </p>
        </div>

        <div>
          <label htmlFor="vinculo" className="font-medium text-foreground">
            Como você chegou até a obra do Elifas Andreato?
          </label>
          <textarea
            id="vinculo"
            name="vinculo"
            rows={3}
            maxLength={600}
            aria-describedby="vinculo-ajuda"
            className={CAMPO}
          />
          <p id="vinculo-ajuda" className="mt-1.5 text-sm text-muted-foreground">
            A exposição, os discos em casa, o trabalho, a cidade dele, a escola — vale qualquer
            porta.
          </p>
        </div>

        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {enviando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {enviando ? "Abrindo…" : "Começar a conversa"}
        </button>
      </form>
    </div>
  );
}
