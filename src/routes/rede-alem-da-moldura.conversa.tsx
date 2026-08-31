import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";

import { chamarRede } from "@/lib/rede-backend";
import {
  Conversa,
  guardarEstado,
  lerEstado,
  lerSessao,
  limparSessao,
  type EstadoTela,
  type Turno,
} from "@/components/rede/Conversa";

type RespostaEstado = {
  conversa_id: string;
  etapa: "A" | "B";
  turnos: Turno[];
  faltam: string[];
  ferramentas: string[];
};

/**
 * Tela limpa da conversa com o Anfitrião: sem cabeçalho nem rodapé do site
 * (o __root esconde os dois neste caminho). Só a conversa ocupa a tela.
 *
 * O estado vem do sessionStorage (acabou de abrir ou de retomar). Num
 * refresh ele já era, então reconstruímos pelo servidor com a ação `estado`,
 * usando a sessão guardada — a conversa nunca se perde por um F5.
 */
export const Route = createFileRoute("/rede-alem-da-moldura/conversa")({
  head: () => ({
    meta: [
      { title: "Conversa — Rede Além da Moldura" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TelaConversa,
});

function TelaConversa() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<EstadoTela | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    // Pintura imediata com o que está no navegador; em seguida o servidor
    // manda a versão de verdade — num refresh o sessionStorage sobrevive e
    // estaria desatualizado (só tem o primeiro turno).
    const guardado = lerEstado();
    if (guardado) setEstado(guardado);

    const sessao = lerSessao();
    if (!sessao) {
      void navigate({ to: "/rede-alem-da-moldura", replace: true });
      return;
    }

    void (async () => {
      try {
        const r = await chamarRede<RespostaEstado>("rede-conversa", {
          action: "estado",
          conversa_id: sessao.conversa_id,
          sessao: sessao.sessao,
        });
        const reconstruido: EstadoTela = {
          conversaId: r.conversa_id,
          sessao: sessao.sessao,
          turnos: r.turnos,
          faltam: r.faltam?.length ?? 1,
          ferramentas: r.ferramentas ?? [],
        };
        guardarEstado(reconstruido);
        setEstado(reconstruido);
      } catch (e) {
        // Com estado guardado, uma falha de rede não derruba a tela.
        if (guardado) return;
        limparSessao();
        setErro(e instanceof Error ? e.message : "Não foi possível reabrir a conversa.");
      }
    })();
  }, [navigate]);

  function sair() {
    limparSessao();
    void navigate({ to: "/rede-alem-da-moldura" });
  }

  if (erro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Não conseguimos reabrir a conversa
        </h1>
        <p role="alert" className="mt-3 text-destructive">
          {erro}
        </p>
        <button
          type="button"
          onClick={() => void navigate({ to: "/rede-alem-da-moldura" })}
          className="mt-6 inline-flex min-h-[44px] items-center rounded-md border border-border px-5 font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Voltar para a página da Rede
        </button>
      </div>
    );
  }

  if (!estado) {
    return (
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-16 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Abrindo a conversa…
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="mx-auto w-full max-w-2xl px-4 pt-4">
        <button
          type="button"
          onClick={sair}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Sair da conversa
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <Conversa
          className="h-full"
          conversaId={estado.conversaId}
          sessao={estado.sessao}
          turnosIniciais={estado.turnos}
          faltamIniciais={estado.faltam}
          ferramentasIniciais={estado.ferramentas}
        />
      </div>
    </div>
  );
}
