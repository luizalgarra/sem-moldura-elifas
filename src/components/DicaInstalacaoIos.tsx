import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

const CHAVE = "pwa-dica-adiada-ate";
const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

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

/**
 * Dica de instalação na tela de início, para quem chega pelo QR Code da exposição.
 *
 * O iOS não oferece prompt automático de instalação — os três toques do menu
 * Compartilhar são sempre manuais. Sem uma dica, quase ninguém descobre que dá
 * para guardar o catálogo no telefone.
 *
 * Aparece só no iOS, fora do modo standalone, e a partir da segunda tela:
 * quem acabou de escanear o QR na parede quer ver a obra, não um banner.
 */
export function DicaInstalacaoIos() {
  const [aberta, setAberta] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const telas = useRef(0);
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    telas.current += 1;
    if (aberta || telas.current < 2) return;
    if (!ehIos() || jaInstalado() || adiada()) return;
    const t = setTimeout(() => setAberta(true), 1200);
    return () => clearTimeout(t);
  }, [pathname, aberta]);

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
    try {
      localStorage.setItem(CHAVE, String(Date.now() + TRINTA_DIAS));
    } catch {
      // navegação privada: tudo bem, some só nesta sessão
    }
    setAberta(false);
  }

  if (!aberta) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Adicionar o catálogo à tela de início"
      className="fixed inset-x-3 z-50 rounded-2xl border border-border bg-card p-4 shadow-2xl"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <p className="text-sm leading-relaxed text-foreground">
        Deixe o catálogo a um toque: abra <IconeCompartilhar />{" "}
        <strong className="font-semibold">Compartilhar</strong> e escolha{" "}
        <strong className="font-semibold">Adicionar à Tela de Início</strong>.
      </p>
      <button
        ref={botaoRef}
        onClick={fechar}
        className="mt-3 min-h-[44px] w-full rounded-xl border border-input px-4 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Agora não
      </button>
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
