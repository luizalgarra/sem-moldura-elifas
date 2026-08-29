import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

const CHAVE = "pwa-dica-adiada-ate";
const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

type EventoDeInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/*
 * O `beforeinstallprompt` do Chrome dispara cedo — muitas vezes antes de o React
 * hidratar. Por isso o listener é registrado no escopo do módulo, que roda assim
 * que o bundle é avaliado, e não dentro de um useEffect. O evento fica guardado
 * até alguém querer usá-lo.
 */
let eventoGuardado: EventoDeInstalacao | null = null;
const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // segura o banner nativo; a gente decide a hora
    eventoGuardado = e as EventoDeInstalacao;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    eventoGuardado = null;
    avisar();
  });
}

function assinar(fn: () => void) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}

function ehIos() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function jaInstalado() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function adiada() {
  try {
    return Date.now() < Number(localStorage.getItem(CHAVE) ?? 0);
  } catch {
    return false;
  }
}

function adiar() {
  try {
    localStorage.setItem(CHAVE, String(Date.now() + TRINTA_DIAS));
  } catch {
    // navegação privada: tudo bem, some só nesta sessão
  }
}

/**
 * Convite para guardar o catálogo na tela de início.
 *
 * Duas realidades diferentes:
 *
 * - Android: o Chrome expõe o `beforeinstallprompt`, então existe um botão de
 *   verdade que instala com um toque. O banner nativo do Chrome é discreto e
 *   passa batido; numa exposição em que a pessoa chega por um QR Code na parede,
 *   vale ter o convite no visual do site.
 *
 * - iOS: não existe API de instalação. Os três toques do menu Compartilhar são
 *   sempre manuais, então tudo que dá para fazer é ensinar o caminho.
 *
 * Em ambos, só aparece a partir da segunda tela: quem acabou de escanear o QR
 * quer ver a obra, não um banner.
 */
export function DicaInstalacao() {
  const [aberta, setAberta] = useState(false);
  const [instalando, setInstalando] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const telas = useRef(0);
  const botaoRef = useRef<HTMLButtonElement>(null);

  // Começa em false para o HTML do servidor e o da hidratação baterem.
  // O valor real chega logo depois, pelo efeito abaixo.
  const [temPrompt, setTemPrompt] = useState(false);

  useEffect(() => {
    const sincronizar = () => setTemPrompt(eventoGuardado !== null);
    sincronizar(); // o evento pode ter chegado antes de o React montar
    return assinar(sincronizar);
  }, []);

  const ios = ehIos();
  const podeConvidar = ios || temPrompt;

  useEffect(() => {
    telas.current += 1;
    if (aberta || telas.current < 2) return;
    if (!podeConvidar || jaInstalado() || adiada()) return;
    const t = setTimeout(() => setAberta(true), 1200);
    return () => clearTimeout(t);
  }, [pathname, aberta, podeConvidar]);

  // Se o Android instalar, o evento some e o convite sai da tela sozinho.
  useEffect(() => {
    if (!ios && !temPrompt) setAberta(false);
  }, [ios, temPrompt]);

  useEffect(() => {
    if (!aberta) return;
    botaoRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberta]);

  function fechar() {
    adiar();
    setAberta(false);
  }

  async function instalar() {
    const evento = eventoGuardado;
    if (!evento) return;
    setInstalando(true);
    try {
      await evento.prompt();
      const { outcome } = await evento.userChoice;
      if (outcome === "dismissed") adiar();
    } catch {
      // o prompt só pode ser usado uma vez; se falhar, não insiste
    } finally {
      eventoGuardado = null; // consumido
      avisar();
      setInstalando(false);
      setAberta(false);
    }
  }

  if (!aberta) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Guardar o catálogo na tela de início"
      className="fixed inset-x-3 z-50 rounded-2xl border border-border bg-card p-4 shadow-2xl"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {ios ? (
        <p className="text-sm leading-relaxed text-foreground">
          Deixe o catálogo a um toque: abra <IconeCompartilhar />{" "}
          <strong className="font-semibold">Compartilhar</strong> e escolha{" "}
          <strong className="font-semibold">Adicionar à Tela de Início</strong>.
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-foreground">
          Guarde o catálogo no seu celular. Ele abre como um app, e as obras que você já viu
          continuam disponíveis mesmo sem internet.
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {!ios && (
          <button
            onClick={instalar}
            disabled={instalando}
            className="min-h-[44px] flex-1 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {instalando ? "Instalando…" : "Instalar"}
          </button>
        )}
        <button
          ref={botaoRef}
          onClick={fechar}
          className={`min-h-[44px] rounded-xl border border-input px-4 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
            ios ? "w-full" : ""
          }`}
        >
          Agora não
        </button>
      </div>
    </div>
  );
}

function IconeCompartilhar() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="inline h-[1.1em] w-[1.1em] -translate-y-[1px] align-middle text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M12 3l-3.5 3.5M12 3l3.5 3.5" />
      <path d="M7 10H5.5A1.5 1.5 0 0 0 4 11.5v8A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 18.5 10H17" />
    </svg>
  );
}
