import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Video, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { salvarPostagemReels, type ObraAcervo } from "@/lib/admin-obras.functions";
import {
  blobParaBase64,
  gerarReelsDaObra,
  montarFonteAudio,
} from "@/lib/gerar-reels";

function suportaGeracao(): boolean {
  if (typeof window === "undefined") return false;
  const canvasOk = typeof HTMLCanvasElement !== "undefined";
  const audioOk =
    typeof window.AudioContext !== "undefined" ||
    typeof (window as unknown as { webkitAudioContext?: unknown })
      .webkitAudioContext !== "undefined";
  return canvasOk && audioOk;
}

export function GeradorReels({ obra }: { obra: ObraAcervo }) {
  const suportado = useMemo(suportaGeracao, []);

  // Fontes de áudio disponíveis na obra.
  const trechosUrls = useMemo(
    () => (obra.audioTrechos ?? []).map((t) => t.url),
    [obra.audioTrechos],
  );
  const unicoUrl = obra.audioFem ?? obra.audio ?? obra.audioMasc ?? null;

  const temVariosTrechos = trechosUrls.length > 1;
  const temAudio = trechosUrls.length > 0 || Boolean(unicoUrl);

  const [escolha, setEscolha] = useState<"sequencia" | "primeiro">("sequencia");
  const [estado, setEstado] = useState<
    "ocioso" | "preparando" | "convertendo" | "pronto" | "erro"
  >("ocioso");
  const [erro, setErro] = useState<string | null>(null);
  const [conversaoPct, setConversaoPct] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [salvamento, setSalvamento] = useState<
    "ocioso" | "salvando" | "salvo" | "erro"
  >("ocioso");

  const salvar = useServerFn(salvarPostagemReels);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const gerar = useCallback(async () => {
    const fonte = montarFonteAudio(obra, escolha);
    if (fonte.tipo === "nenhum") {
      setErro("Esta obra não tem áudio gerado.");
      setEstado("erro");
      return;
    }
    if (!obra.imagem) {
      setErro("Esta obra não tem imagem.");
      setEstado("erro");
      return;
    }

    setEstado("preparando");
    setErro(null);
    setConversaoPct(0);
    setSalvamento("ocioso");
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    try {
      setEstado("convertendo");
      const blob = await gerarReelsDaObra(obra, {
        canvas: canvasRef.current!,
        escolha,
        onProgress: setConversaoPct,
      });

      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setConversaoPct(100);
      setEstado("pronto");

      // Salva automaticamente a postagem.
      setSalvamento("salvando");
      try {
        const base64 = await blobParaBase64(blob);
        const res = await salvar({
          data: { num: obra.num, titulo: obra.titulo, base64, ext: "mp4" },
        });
        setSalvamento(res?.ok ? "salvo" : "erro");
        if (!res?.ok) {
          console.error("Falha ao salvar postagem:", res?.erro);
        }
      } catch (e) {
        console.error(e);
        setSalvamento("erro");
      }
    } catch (e) {
      console.error(e);
      setErro(
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : "Erro inesperado ao gerar o vídeo.",
      );
      setEstado("erro");
    }
  }, [obra, escolha, videoUrl, salvar]);

  if (!temAudio) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        Esta obra ainda não tem áudio gerado, então não é possível montar o
        reels.
      </div>
    );
  }

  if (!suportado) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Este navegador não suporta a geração do vídeo. Use o Chrome, Edge ou
          Firefox no computador.
        </span>
      </div>
    );
  }

  const processando = estado === "preparando" || estado === "convertendo";

  return (
    <div className="space-y-5">
      {temVariosTrechos && (
        <fieldset className="rounded-lg border border-border bg-card p-4">
          <legend className="px-1 text-sm font-medium text-foreground">
            Áudio do vídeo
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="audio-reels"
                checked={escolha === "sequencia"}
                onChange={() => setEscolha("sequencia")}
                disabled={processando}
              />
              Sequência completa ({trechosUrls.length} trechos)
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="audio-reels"
                checked={escolha === "primeiro"}
                onChange={() => setEscolha("primeiro")}
                disabled={processando}
              />
              Apenas o 1º trecho
            </label>
          </div>
        </fieldset>
      )}

      <p className="text-xs text-muted-foreground">
        O vídeo é montado direto a partir da imagem e do áudio — não é mais
        necessário esperar a gravação em tempo real.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={gerar} disabled={processando} className="min-h-11">
          {processando ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Video aria-hidden="true" />
          )}
          <span>
            {estado === "preparando"
              ? "Preparando…"
              : estado === "convertendo"
                ? `Gerando MP4… ${conversaoPct}%`
                : estado === "pronto"
                  ? "Gerar de novo"
                  : "Gerar vídeo"}
          </span>
        </Button>

        {videoUrl && (
          <Button asChild variant="outline" className="min-h-11">
            <a href={videoUrl} download={`obra-${obra.num}-reels.mp4`}>
              <Download aria-hidden="true" />
              <span>Baixar MP4</span>
            </a>
          </Button>
        )}
      </div>

      {salvamento === "salvando" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Salvando postagem…
        </p>
      )}
      {salvamento === "salvo" && (
        <p className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
          Postagem salva em{" "}
          <Link to="/postagens" className="font-medium text-accent underline">
            Postagens
          </Link>
          .
        </p>
      )}
      {salvamento === "erro" && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          O vídeo foi gerado, mas não foi possível salvá-lo. Você ainda pode
          baixá-lo acima.
        </p>
      )}

      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{erro}</span>
        </div>
      )}

      {/* Canvas oculto usado para a montagem. */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {videoUrl && (
        <div className="overflow-hidden rounded-lg border border-border bg-black">
          <video
            src={videoUrl}
            controls
            playsInline
            className="mx-auto max-h-[70vh] w-auto"
          />
        </div>
      )}
    </div>
  );
}
