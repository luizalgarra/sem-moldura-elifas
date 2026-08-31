import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { chamarRede, type RespostaConversa } from "@/lib/rede-backend";

export type Turno = { de: "anfitriao" | "pessoa"; texto: string };

/** Estado mínimo para montar a tela da conversa sem chamar o servidor. */
export type EstadoTela = {
  conversaId: string;
  sessao: string;
  turnos: Turno[];
  faltam: number;
  ferramentas: string[];
};

const CHAVE_SESSAO = "rede-conversa";
const CHAVE_ESTADO = "rede-estado";

export function guardarSessao(conversa_id: string, sessao: string) {
  try {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ conversa_id, sessao }));
  } catch {
    // Aba anônima bloqueia sessionStorage. A conversa segue, só não sobrevive a um refresh.
  }
}

export function lerSessao(): { conversa_id: string; sessao: string } | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO);
    return bruto ? (JSON.parse(bruto) as { conversa_id: string; sessao: string }) : null;
  } catch {
    return null;
  }
}

/** Guarda o estado inicial da conversa, para a tela limpa abrir sem nova chamada. */
export function guardarEstado(estado: EstadoTela) {
  try {
    sessionStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
  } catch {
    /* idem */
  }
}

export function lerEstado(): EstadoTela | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_ESTADO);
    return bruto ? (JSON.parse(bruto) as EstadoTela) : null;
  } catch {
    return null;
  }
}

export function limparSessao() {
  try {
    sessionStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_ESTADO);
  } catch {
    /* idem */
  }
}

/** Renderiza URLs soltas no texto como links clicáveis — inclusive o link
 *  relativo /continuar?t=... gravado antes de o servidor mandar a URL cheia. */
function TextoComLinks({ texto }: { texto: string }) {
  const partes = texto.split(/(https?:\/\/[^\s<>()]+|\/continuar\?t=[a-f0-9]+)/g);
  return (
    <>
      {partes.map((parte, i) =>
        /^(https?:\/\/|\/continuar\?)/.test(parte) ? (
          <a
            key={i}
            href={parte}
            className="text-accent underline underline-offset-2 break-all"
          >
            {parte}
          </a>
        ) : (
          <span key={i} className="whitespace-pre-wrap">
            {parte}
          </span>
        ),
      )}
    </>
  );
}

type Props = {
  conversaId: string;
  sessao: string;
  turnosIniciais: Turno[];
  faltamIniciais: number;
  ferramentasIniciais: string[];
};

export function Conversa({
  conversaId,
  sessao,
  turnosIniciais,
  faltamIniciais,
  ferramentasIniciais,
}: Props) {
  const [turnos, setTurnos] = useState<Turno[]>(turnosIniciais);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ferramentas, setFerramentas] = useState<string[]>(ferramentasIniciais);
  const [propostaVisivel, setPropostaVisivel] = useState(true);
  const [aprovada, setAprovada] = useState(false);

  // O total inicial de pendências é a régua da barra: ela avança conforme faltam[] encolhe.
  const totalRef = useRef(Math.max(faltamIniciais, 1));
  const [faltam, setFaltam] = useState(faltamIniciais);
  const fimRef = useRef<HTMLDivElement | null>(null);
  const campoRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turnos, enviando]);

  const encerrada = ferramentas.includes("emitir_link_retomada") || aprovada;
  const propoeFicha = ferramentas.includes("propor_ficha") && propostaVisivel && !aprovada;
  const progresso = Math.min(
    100,
    Math.round(((totalRef.current - faltam) / totalRef.current) * 100),
  );

  function aplicar(resposta: RespostaConversa) {
    setTurnos((atual) => [...atual, { de: "anfitriao", texto: resposta.mensagem }]);
    const pendentes = resposta.faltam?.length ?? 0;
    if (pendentes > totalRef.current) totalRef.current = pendentes;
    setFaltam(pendentes);
    setFerramentas(resposta.ferramentas ?? []);
    setPropostaVisivel(true);
  }

  async function falar() {
    const conteudo = texto.trim();
    if (!conteudo || enviando) return;
    setTurnos((atual) => [...atual, { de: "pessoa", texto: conteudo }]);
    setTexto("");
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await chamarRede<RespostaConversa>("rede-conversa", {
        action: "falar",
        conversa_id: conversaId,
        sessao,
        texto: conteudo,
      });
      aplicar(resposta);
    } catch (e) {
      setErro(
        `${e instanceof Error ? e.message : "Algo falhou."} O que você escreveu está guardado — pode tentar de novo.`,
      );
    } finally {
      setEnviando(false);
    }
  }

  async function aprovarFicha() {
    setEnviando(true);
    setErro(null);
    try {
      await chamarRede("rede-conversa", {
        action: "aprovar_ficha",
        conversa_id: conversaId,
        sessao,
      });
      setAprovada(true);
      limparSessao();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível confirmar agora.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Barra sem rótulo: mostra que a conversa anda, sem contar etapas. */}
      <div
        className="h-0.5 w-full overflow-hidden rounded-full bg-border"
        role="presentation"
      >
        <div
          className="h-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="mt-8 space-y-4" aria-live="polite">
        {turnos.map((turno, i) => (
          <div
            key={i}
            className={turno.de === "pessoa" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                turno.de === "pessoa"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground"
                  : "max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-card-foreground"
              }
            >
              {turno.de === "anfitriao" && (
                <p className="mb-1 text-xs tracking-[0.14em] text-accent uppercase">
                  Anfitrião
                </p>
              )}
              <div className="leading-relaxed">
                <TextoComLinks texto={turno.texto} />
              </div>
            </div>
          </div>
        ))}

        {enviando && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span className="text-sm">digitando…</span>
            </div>
          </div>
        )}

        {propoeFicha && !enviando && (
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={aprovarFicha}
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Está certo assim
            </button>
            <button
              type="button"
              onClick={() => {
                setPropostaVisivel(false);
                campoRef.current?.focus();
              }}
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-5 font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Quero mudar algo
            </button>
          </div>
        )}

        {aprovada && (
          <p className="rounded-lg border border-accent/40 bg-secondary/40 p-5 text-muted-foreground">
            Pronto. Sua ficha foi para o Guardião da Rede, que vai te chamar para a próxima
            roda. Obrigado pelo tempo.
          </p>
        )}

        <div ref={fimRef} />
      </div>

      {erro && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {erro}
        </p>
      )}

      {!encerrada && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void falar();
          }}
          className="mt-6"
        >
          <label htmlFor="resposta" className="sr-only">
            Sua resposta
          </label>
          <textarea
            id="resposta"
            ref={campoRef}
            value={texto}
            rows={1}
            onChange={(e) => {
              setTexto(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void falar();
              }
            }}
            placeholder="Escreva aqui…"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-3 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:outline-none"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Enter envia · Shift+Enter quebra linha
            </p>
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              Enviar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
