import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { chamarRede, type RespostaConversa } from "@/lib/rede-backend";
import { Conversa, guardarSessao, type Turno } from "@/components/rede/Conversa";

type Estado = {
  conversaId: string;
  sessao: string;
  turnos: Turno[];
  faltam: number;
  ferramentas: string[];
};

/**
 * Retomada por token (`/continuar?t=…`). É o link que o Anfitrião entrega ao
 * fim da primeira conversa. Não passa pelo formulário: vai direto ao
 * `rede-conversa/retomar`.
 */
export function Retomar() {
  const [conversa, setConversa] = useState<Estado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    const token = new URLSearchParams(window.location.search).get("t");
    if (!token) {
      setErro("Este link não tem um código de retomada.");
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
        setErro(e instanceof Error ? e.message : "Não foi possível retomar a conversa.");
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

  if (erro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Este link não está mais válido
        </h1>
        <p role="alert" className="mt-3 text-destructive">
          {erro}
        </p>
        <p className="mt-3 text-muted-foreground">
          Peça um novo link ao Guardião da Rede para continuar de onde você parou, ou{" "}
          <Link
            to="/rede-alem-da-moldura"
            className="text-accent underline underline-offset-2"
          >
            comece pela página da Rede
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!conversa) return null;

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
