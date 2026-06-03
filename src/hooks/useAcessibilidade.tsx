import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AcessibilidadeContexto {
  escala: number;
  altoContraste: boolean;
  aumentarFonte: () => void;
  diminuirFonte: () => void;
  resetarFonte: () => void;
  alternarContraste: () => void;
}

const Contexto = createContext<AcessibilidadeContexto | null>(null);

const ESCALA_MIN = 0.9;
const ESCALA_MAX = 1.6;
const PASSO = 0.1;

export function AcessibilidadeProvider({ children }: { children: ReactNode }) {
  const [escala, setEscala] = useState(1);
  const [altoContraste, setAltoContraste] = useState(false);

  useEffect(() => {
    try {
      const e = localStorage.getItem("a11y-escala");
      const c = localStorage.getItem("a11y-contraste");
      if (e) setEscala(Number(e));
      if (c) setAltoContraste(c === "1");
    } catch {
      /* ignora */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--escala-fonte", String(escala));
    try {
      localStorage.setItem("a11y-escala", String(escala));
    } catch {
      /* ignora */
    }
  }, [escala]);

  useEffect(() => {
    document.documentElement.classList.toggle("alto-contraste", altoContraste);
    try {
      localStorage.setItem("a11y-contraste", altoContraste ? "1" : "0");
    } catch {
      /* ignora */
    }
  }, [altoContraste]);

  const aumentarFonte = useCallback(
    () => setEscala((v) => Math.min(ESCALA_MAX, Math.round((v + PASSO) * 10) / 10)),
    [],
  );
  const diminuirFonte = useCallback(
    () => setEscala((v) => Math.max(ESCALA_MIN, Math.round((v - PASSO) * 10) / 10)),
    [],
  );
  const resetarFonte = useCallback(() => setEscala(1), []);
  const alternarContraste = useCallback(() => setAltoContraste((v) => !v), []);

  return (
    <Contexto.Provider
      value={{
        escala,
        altoContraste,
        aumentarFonte,
        diminuirFonte,
        resetarFonte,
        alternarContraste,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAcessibilidade() {
  const ctx = useContext(Contexto);
  if (!ctx) {
    throw new Error("useAcessibilidade deve ser usado dentro de AcessibilidadeProvider");
  }
  return ctx;
}
