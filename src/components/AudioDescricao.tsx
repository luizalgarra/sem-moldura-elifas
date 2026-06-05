import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioDescricaoProps {
  texto: string;
  audio?: string | null;
  audioFem?: string | null;
  audioMasc?: string | null;
}

const VELOCIDADES = [0.75, 1, 1.25] as const;

export function AudioDescricao({
  texto,
  audio,
  audioFem,
  audioMasc,
}: AudioDescricaoProps) {
  const fem = audioFem ?? audio ?? null;
  const masc = audioMasc ?? null;
  if (fem || masc) {
    return <AudioArquivo fem={fem} masc={masc} />;
  }
  return <AudioVoz texto={texto} />;
}

// ---- Reprodução do MP3 pré-gerado (ElevenLabs) ----
function AudioArquivo({
  fem,
  masc,
}: {
  fem: string | null;
  masc: string | null;
}) {
  // Voz inicial: feminina quando existir, senão masculina.
  const [voz, setVoz] = useState<"fem" | "masc">(fem ? "fem" : "masc");
  const src = (voz === "masc" ? masc : fem) ?? fem ?? masc ?? "";
  const temAmbas = !!fem && !!masc;

  const [tocando, setTocando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [velocidade, setVelocidade] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reinicia o estado ao trocar de obra ou de voz
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

      {temAmbas && (
        <div
          className="mt-3 flex items-center gap-1"
          role="group"
          aria-label="Voz da áudio-descrição"
        >
          <Button
            size="sm"
            variant={voz === "fem" ? "default" : "outline"}
            className="min-h-11"
            aria-pressed={voz === "fem"}
            onClick={() => {
              parar();
              setVoz("fem");
            }}
          >
            Voz feminina
          </Button>
          <Button
            size="sm"
            variant={voz === "masc" ? "default" : "outline"}
            className="min-h-11"
            aria-pressed={voz === "masc"}
            onClick={() => {
              parar();
              setVoz("masc");
            }}
          >
            Voz masculina
          </Button>
        </div>
      )}

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
