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
    // Em apps Vite, o worker do @ffmpeg/ffmpeg é do tipo "module".
    // Por isso o core precisa ser ESM; o UMD carrega no download, mas falha no import
    // com "failed to import ffmpeg-core.js" no Chrome/Edge.
    const base = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
    const ffmpeg = new FFmpeg();
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });
    } catch (e) {
      ffmpegPromise = null;
      throw e;
    }
    return ffmpeg;
  })();
  return ffmpegPromise;
}

// Converte um AudioBuffer (PCM) num arquivo WAV em memória.
function audioBufferParaWav(buffer: AudioBuffer): Uint8Array {
  const numCanais = buffer.numberOfChannels;
  const taxa = buffer.sampleRate;
  const amostras = buffer.length;
  const blocoAlinhamento = numCanais * 2;
  const tamanhoDados = amostras * blocoAlinhamento;
  const ab = new ArrayBuffer(44 + tamanhoDados);
  const dv = new DataView(ab);

  const escreverTexto = (offset: number, texto: string) => {
    for (let i = 0; i < texto.length; i++) {
      dv.setUint8(offset + i, texto.charCodeAt(i));
    }
  };

  escreverTexto(0, "RIFF");
  dv.setUint32(4, 36 + tamanhoDados, true);
  escreverTexto(8, "WAVE");
  escreverTexto(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, numCanais, true);
  dv.setUint32(24, taxa, true);
  dv.setUint32(28, taxa * blocoAlinhamento, true);
  dv.setUint16(32, blocoAlinhamento, true);
  dv.setUint16(34, 16, true);
  escreverTexto(36, "data");
  dv.setUint32(40, tamanhoDados, true);

  let offset = 44;
  const canais: Float32Array[] = [];
  for (let c = 0; c < numCanais; c++) {
    canais.push(buffer.getChannelData(c));
  }
  for (let i = 0; i < amostras; i++) {
    for (let c = 0; c < numCanais; c++) {
      let amostra = Math.max(-1, Math.min(1, canais[c][i]));
      amostra = amostra < 0 ? amostra * 0x8000 : amostra * 0x7fff;
      dv.setInt16(offset, amostra, true);
      offset += 2;
    }
  }

  return new Uint8Array(ab);
}

// Junta vários AudioBuffers, em sequência, num único AudioBuffer.
async function concatenarAudios(buffers: AudioBuffer[]): Promise<AudioBuffer> {
  if (buffers.length === 1) return buffers[0];
  const numCanais = Math.max(...buffers.map((b) => b.numberOfChannels));
  const taxa = buffers[0].sampleRate;
  const total = buffers.reduce((s, b) => s + b.length, 0);
  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;
  const ctx = new OfflineCtx(numCanais, total, taxa);
  let quando = 0;
  for (const buf of buffers) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(quando);
    quando += buf.duration;
  }
  return ctx.startRendering();
}

const LARGURA = 720;
const ALTURA = 1280;

type FonteAudio =
  | { tipo: "sequencia"; urls: string[] }
  | { tipo: "primeiro"; urls: string[] }
  | { tipo: "unico"; urls: string[] }
  | { tipo: "nenhum" };

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
      const escalaCover = Math.max(LARGURA / img.width, ALTURA / img.height);
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
      ctx.drawImage(img, (LARGURA - lfit) / 2, (ALTURA - afit) / 2, lfit, afit);
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

    setEstado("preparando");
    setErro(null);
    setConversaoPct(0);
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

      // 2. Renderiza o quadro uma única vez e exporta como PNG.
      const canvas = canvasRef.current!;
      canvas.width = LARGURA;
      canvas.height = ALTURA;
      const ctx = canvas.getContext("2d")!;
      desenhar(ctx, img);
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar o quadro."))),
          "image/png",
        );
      });

      // 3. Decodifica os áudios e concatena em um único arquivo WAV.
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
      await audioCtx.close();

      const audioFinal = await concatenarAudios(buffers);
      const wav = audioBufferParaWav(audioFinal);

      // 4. Encoda o MP4 direto no ffmpeg (imagem em loop + áudio).
      setEstado("convertendo");
      setConversaoPct(0);

      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = await obterFFmpeg();
      const handler = ({ progress }: { progress: number }) => {
        setConversaoPct(Math.max(0, Math.min(100, Math.round(progress * 100))));
      };
      ffmpeg.on("progress", handler);

      await ffmpeg.writeFile("frame.png", await fetchFile(pngBlob));
      const wavAb = new ArrayBuffer(wav.byteLength);
      new Uint8Array(wavAb).set(wav);
      await ffmpeg.writeFile("audio.wav", new Uint8Array(wavAb));

      await ffmpeg.exec([
        "-loop",
        "1",
        "-framerate",
        "30",
        "-i",
        "frame.png",
        "-i",
        "audio.wav",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "28",
        "-tune",
        "stillimage",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-shortest",
        "-movflags",
        "+faststart",
        "out.mp4",
      ]);

      ffmpeg.off("progress", handler);

      const dados = await ffmpeg.readFile("out.mp4");
      const bytes =
        dados instanceof Uint8Array
          ? dados
          : new TextEncoder().encode(String(dados));
      const mp4Ab = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(mp4Ab).set(bytes);
      const blob = new Blob([mp4Ab], { type: "video/mp4" });

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
