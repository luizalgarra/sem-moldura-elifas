import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Video, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { salvarPostagemReels, type ObraAcervo } from "@/lib/admin-obras.functions";

function blobParaBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Falha ao ler o vídeo."));
    fr.readAsDataURL(blob);
  });
}

type FFmpegInstance = import("@ffmpeg/ffmpeg").FFmpeg;
let ffmpegPromise: Promise<FFmpegInstance> | null = null;

async function obterFFmpeg(): Promise<FFmpegInstance> {
  if (ffmpegPromise) return ffmpegPromise;
  ffmpegPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    const base = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
    });
    return ffmpeg;
  })();
  return ffmpegPromise;
}

async function converterParaMp4(webm: Blob): Promise<Blob> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await obterFFmpeg();
  await ffmpeg.writeFile("in.webm", await fetchFile(webm));
  await ffmpeg.exec([
    "-i",
    "in.webm",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    "out.mp4",
  ]);
  const dados = await ffmpeg.readFile("out.mp4");
  const bytes =
    dados instanceof Uint8Array ? dados : new TextEncoder().encode(String(dados));
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return new Blob([ab], { type: "video/mp4" });
}

const LARGURA = 1080;
const ALTURA = 1920;

type FonteAudio =
  | { tipo: "sequencia"; urls: string[] }
  | { tipo: "primeiro"; urls: string[] }
  | { tipo: "unico"; urls: string[] }
  | { tipo: "nenhum" };

function suportaGravacao(): boolean {
  if (typeof window === "undefined") return false;
  const canvasOk =
    typeof HTMLCanvasElement !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function";
  const recOk = typeof MediaRecorder !== "undefined";
  return canvasOk && recOk;
}

function escolherMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const tipos = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm",
  ];
  return tipos.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}

export function GeradorReels({ obra }: { obra: ObraAcervo }) {
  const suportado = useMemo(suportaGravacao, []);

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
    "ocioso" | "gerando" | "convertendo" | "pronto" | "erro"
  >("ocioso");
  const [erro, setErro] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [salvamento, setSalvamento] = useState<
    "ocioso" | "salvando" | "salvo" | "erro"
  >("ocioso");
  const [formato, setFormato] = useState<string>("mp4");
  const [conversaoFalhou, setConversaoFalhou] = useState(false);

  const salvar = useServerFn(salvarPostagemReels);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const montarFonte = useCallback((): FonteAudio => {
    if (trechosUrls.length > 0) {
      if (escolha === "primeiro") {
        return { tipo: "primeiro", urls: [trechosUrls[0]] };
      }
      return { tipo: "sequencia", urls: trechosUrls };
    }
    if (unicoUrl) return { tipo: "unico", urls: [unicoUrl] };
    return { tipo: "nenhum" };
  }, [trechosUrls, unicoUrl, escolha]);

  const desenhar = useCallback(
    (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
      ctx.clearRect(0, 0, LARGURA, ALTURA);
      // Fundo: imagem ampliada e borrada cobrindo todo o quadro (cover).
      const escalaCover = Math.max(
        LARGURA / img.width,
        ALTURA / img.height,
      );
      const lcover = img.width * escalaCover;
      const acover = img.height * escalaCover;
      ctx.save();
      ctx.filter = "blur(40px) brightness(0.75)";
      ctx.drawImage(
        img,
        (LARGURA - lcover) / 2,
        (ALTURA - acover) / 2,
        lcover,
        acover,
      );
      ctx.restore();

      // Frente: imagem inteira contida (contain), centralizada.
      const escalaFit = Math.min(LARGURA / img.width, ALTURA / img.height);
      const lfit = img.width * escalaFit;
      const afit = img.height * escalaFit;
      ctx.drawImage(
        img,
        (LARGURA - lfit) / 2,
        (ALTURA - afit) / 2,
        lfit,
        afit,
      );
    },
    [],
  );

  const gerar = useCallback(async () => {
    const fonte = montarFonte();
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
    const mime = escolherMime();
    if (!mime) {
      setErro("Seu navegador não suporta gravação de vídeo (MediaRecorder).");
      setEstado("erro");
      return;
    }

    setEstado("gerando");
    setErro(null);
    setProgresso(0);
    setSalvamento("ocioso");
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    try {
      // 1. Carrega a imagem.
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.crossOrigin = "anonymous";
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Falha ao carregar a imagem."));
        el.src = obra.imagem as string;
      });

      // 2. Decodifica os áudios.
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioCtx = new AudioCtx();
      const buffers: AudioBuffer[] = [];
      for (const url of fonte.urls) {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Falha ao baixar o áudio.");
        const arr = await resp.arrayBuffer();
        const buf = await audioCtx.decodeAudioData(arr);
        buffers.push(buf);
      }
      const duracaoTotal = buffers.reduce((s, b) => s + b.duration, 0);

      // 3. Canvas + stream de vídeo.
      const canvas = canvasRef.current!;
      canvas.width = LARGURA;
      canvas.height = ALTURA;
      const ctx = canvas.getContext("2d")!;
      desenhar(ctx, img);
      const videoStream = canvas.captureStream(30);

      // 4. Áudio agendado em sequência -> destino de stream.
      const destino = audioCtx.createMediaStreamDestination();
      let quando = audioCtx.currentTime + 0.1;
      for (const buf of buffers) {
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(destino);
        src.start(quando);
        quando += buf.duration;
      }

      // 5. Combina faixas e grava.
      const stream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...destino.stream.getAudioTracks(),
      ]);
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const inicio = performance.now();
      let raf = 0;
      const loop = () => {
        desenhar(ctx, img);
        const decorrido = (performance.now() - inicio) / 1000;
        setProgresso(Math.min(99, Math.round((decorrido / duracaoTotal) * 100)));
        raf = requestAnimationFrame(loop);
      };

      const finalizado = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          cancelAnimationFrame(raf);
          resolve(new Blob(chunks, { type: mime }));
        };
      });

      recorder.start();
      raf = requestAnimationFrame(loop);

      // Para a gravação ao fim do áudio (+ pequena folga).
      await new Promise((r) => setTimeout(r, (duracaoTotal + 0.5) * 1000));
      recorder.stop();

      const webmBlob = await finalizado;
      await audioCtx.close();

      // Converte para MP4 no navegador (com fallback para webm em caso de falha).
      setEstado("convertendo");
      setProgresso(100);
      let blob = webmBlob;
      let ext = "webm";
      try {
        blob = await converterParaMp4(webmBlob);
        ext = "mp4";
      } catch (e) {
        console.error("Falha ao converter para MP4:", e);
        setConversaoFalhou(true);
      }
      setFormato(ext);

      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setEstado("pronto");

      // Salva automaticamente a postagem.
      setSalvamento("salvando");
      try {
        const base64 = await blobParaBase64(blob);
        const res = await salvar({
          data: { num: obra.num, titulo: obra.titulo, base64, ext },
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
        e instanceof Error ? e.message : "Erro inesperado ao gerar o vídeo.",
      );
      setEstado("erro");
    }
  }, [montarFonte, obra.imagem, obra.num, obra.titulo, desenhar, videoUrl, salvar]);

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
          Este navegador não suporta a gravação do vídeo. Use o Chrome, Edge ou
          Firefox no computador.
        </span>
      </div>
    );
  }

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
                disabled={estado === "gerando"}
              />
              Sequência completa ({trechosUrls.length} trechos)
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="audio-reels"
                checked={escolha === "primeiro"}
                onChange={() => setEscolha("primeiro")}
                disabled={estado === "gerando"}
              />
              Apenas o 1º trecho
            </label>
          </div>
        </fieldset>
      )}

      <p className="text-xs text-muted-foreground">
        A gravação acontece em tempo real. Mantenha esta aba em primeiro plano
        até o vídeo ficar pronto.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={gerar}
          disabled={estado === "gerando"}
          className="min-h-11"
        >
          {estado === "gerando" ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Video aria-hidden="true" />
          )}
          <span>
            {estado === "gerando"
              ? `Gerando… ${progresso}%`
              : estado === "pronto"
                ? "Gerar de novo"
                : "Gerar vídeo"}
          </span>
        </Button>

        {videoUrl && (
          <Button asChild variant="outline" className="min-h-11">
            <a href={videoUrl} download={`obra-${obra.num}-reels.webm`}>
              <Download aria-hidden="true" />
              <span>Baixar vídeo</span>
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
