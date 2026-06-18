import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrechoPublico } from "@/lib/admin-obras.functions";

interface AudioDescricaoProps {
  texto: string;
  audio?: string | null;
  audioFem?: string | null;
  audioMasc?: string | null;
  audioTrechos?: TrechoPublico[] | null;
}

const VELOCIDADES = [0.75, 1, 1.25] as const;



export function AudioDescricao({
  texto,
  audio,
  audioFem,
  audioMasc,
  audioTrechos,
}: AudioDescricaoProps) {
  // Preferência: locução alternada por seção.
  if (audioTrechos && audioTrechos.length > 0) {
    return <AudioSequencia trechos={audioTrechos} />;
  }
  // Fallback: áudio único (obra especial ou registros antigos).
  const unico = audioFem ?? audio ?? audioMasc ?? null;
  if (unico) {
    return <AudioArquivo src={unico} />;
  }
  return <AudioVoz texto={texto} />;
}

// ---- Locução alternada: reproduz os trechos em sequência ----
function AudioSequencia({ trechos }: { trechos: TrechoPublico[] }) {
  const [idx, setIdx] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [velocidade, setVelocidade] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reinicia ao trocar de obra.
  useEffect(() => {
    setIdx(0);
    setTocando(false);
    setPausado(false);
  }, [trechos]);

  // Ao avançar de trecho, toca o próximo automaticamente.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (tocando && !pausado) {
      el.playbackRate = velocidade;
      void el.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const alternar = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!tocando) {
      el.playbackRate = velocidade;
      void el.play();
      setTocando(true);
      setPausado(false);
    } else if (pausado) {
      el.playbackRate = velocidade;
      void el.play();
      setPausado(false);
    } else {
      el.pause();
      setPausado(true);
    }
  }, [tocando, pausado, velocidade]);

  const parar = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setTocando(false);
    setPausado(false);
    setIdx(0);
  }, []);

  const aoTerminar = useCallback(() => {
    setIdx((i) => {
      if (i < trechos.length - 1) return i + 1;
      // Fim da sequência.
      setTocando(false);
      setPausado(false);
      return 0;
    });
  }, [trechos.length]);

  const atual = trechos[idx];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Volume2 className="size-5 text-accent" aria-hidden="true" />
        <span>Áudio-descrição</span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground" role="status">
        {tocando ? (
          <>
            Tocando {idx + 1}/{trechos.length}: {atual?.rotulo}
          </>
        ) : (
          <>Áudio-descrição · {trechos.length} trechos</>
        )}
      </p>

      <audio
        ref={audioRef}
        src={atual?.url}
        preload="none"
        onEnded={aoTerminar}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          onClick={alternar}
          className="min-h-11"
          aria-label={
            !tocando
              ? "Ouvir a áudio-descrição"
              : pausado
                ? "Continuar a áudio-descrição"
                : "Pausar a áudio-descrição"
          }
        >
          {!tocando || pausado ? (
            <Play aria-hidden="true" />
          ) : (
            <Pause aria-hidden="true" />
          )}
          <span>{!tocando ? "Ouvir" : pausado ? "Continuar" : "Pausar"}</span>
        </Button>
        <Button
          variant="outline"
          onClick={parar}
          disabled={!tocando}
          className="min-h-11"
          aria-label="Reiniciar a áudio-descrição"
        >
          <RotateCcw aria-hidden="true" />
          <span>Parar</span>
        </Button>

        <div
          className="ml-auto flex items-center gap-1"
          role="group"
          aria-label="Velocidade da leitura"
        >
          {VELOCIDADES.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={velocidade === v ? "default" : "outline"}
              className="min-h-11 min-w-11"
              aria-pressed={velocidade === v}
              onClick={() => {
                setVelocidade(v);
                if (audioRef.current) audioRef.current.playbackRate = v;
              }}
            >
              {v}×
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Reprodução de um MP3 único (fallback: obra especial / legado) ----
function AudioArquivo({ src }: { src: string }) {
  const [tocando, setTocando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [velocidade, setVelocidade] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTocando(false);
    setPausado(false);
  }, [src]);

  const alternar = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!tocando || pausado) {
      el.playbackRate = velocidade;
      void el.play();
      setTocando(true);
      setPausado(false);
    } else {
      el.pause();
      setPausado(true);
    }
  }, [tocando, pausado, velocidade]);

  const parar = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setTocando(false);
    setPausado(false);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Volume2 className="size-5 text-accent" aria-hidden="true" />
        <span>Áudio-descrição</span>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onEnded={() => {
          setTocando(false);
          setPausado(false);
        }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          onClick={alternar}
          className="min-h-11"
          aria-label={
            !tocando
              ? "Ouvir a áudio-descrição"
              : pausado
                ? "Continuar a áudio-descrição"
                : "Pausar a áudio-descrição"
          }
        >
          {!tocando || pausado ? (
            <Play aria-hidden="true" />
          ) : (
            <Pause aria-hidden="true" />
          )}
          <span>{!tocando ? "Ouvir" : pausado ? "Continuar" : "Pausar"}</span>
        </Button>
        <Button
          variant="outline"
          onClick={parar}
          disabled={!tocando}
          className="min-h-11"
          aria-label="Reiniciar a áudio-descrição"
        >
          <RotateCcw aria-hidden="true" />
          <span>Parar</span>
        </Button>

        <div
          className="ml-auto flex items-center gap-1"
          role="group"
          aria-label="Velocidade da leitura"
        >
          {VELOCIDADES.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={velocidade === v ? "default" : "outline"}
              className="min-h-11 min-w-11"
              aria-pressed={velocidade === v}
              onClick={() => {
                setVelocidade(v);
                if (audioRef.current) audioRef.current.playbackRate = v;
              }}
            >
              {v}×
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Fallback: leitura por voz do navegador (speechSynthesis) ----
function AudioVoz({ texto }: { texto: string }) {
  const [suportado, setSuportado] = useState(true);
  const [tocando, setTocando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [velocidade, setVelocidade] = useState<number>(1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSuportado(false);
    }
  }, []);

  const parar = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setTocando(false);
    setPausado(false);
  }, []);

  // Para a fala ao desmontar ou trocar de obra
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [texto]);

  const iniciar = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";
    u.rate = velocidade;
    u.onend = () => {
      setTocando(false);
      setPausado(false);
    };
    u.onerror = () => {
      setTocando(false);
      setPausado(false);
    };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setTocando(true);
    setPausado(false);
  }, [texto, velocidade]);

  const alternar = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    if (!tocando) {
      iniciar();
    } else if (pausado) {
      window.speechSynthesis.resume();
      setPausado(false);
    } else {
      window.speechSynthesis.pause();
      setPausado(true);
    }
  }, [tocando, pausado, iniciar]);

  if (!suportado) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        A leitura por voz não é suportada neste navegador. O texto da
        áudio-descrição está disponível logo abaixo.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Volume2 className="size-5 text-accent" aria-hidden="true" />
        <span>Áudio-descrição</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          onClick={alternar}
          className="min-h-11"
          aria-label={
            !tocando
              ? "Ouvir a áudio-descrição"
              : pausado
                ? "Continuar a áudio-descrição"
                : "Pausar a áudio-descrição"
          }
        >
          {!tocando || pausado ? (
            <Play aria-hidden="true" />
          ) : (
            <Pause aria-hidden="true" />
          )}
          <span>{!tocando ? "Ouvir" : pausado ? "Continuar" : "Pausar"}</span>
        </Button>
        <Button
          variant="outline"
          onClick={parar}
          disabled={!tocando}
          className="min-h-11"
          aria-label="Reiniciar a áudio-descrição"
        >
          <RotateCcw aria-hidden="true" />
          <span>Parar</span>
        </Button>

        <div
          className="ml-auto flex items-center gap-1"
          role="group"
          aria-label="Velocidade da leitura"
        >
          {VELOCIDADES.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={velocidade === v ? "default" : "outline"}
              className="min-h-11 min-w-11"
              aria-pressed={velocidade === v}
              onClick={() => {
                setVelocidade(v);
                if (tocando) {
                  parar();
                }
              }}
            >
              {v}×
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
