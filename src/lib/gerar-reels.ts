import type { ObraAcervo } from "@/lib/admin-obras.functions";

export const LARGURA = 720;
export const ALTURA = 1280;

type FFmpegInstance = import("@ffmpeg/ffmpeg").FFmpeg;
let ffmpegPromise: Promise<FFmpegInstance> | null = null;

/** Carrega (uma única vez) a instância do ffmpeg em WebAssembly. */
export async function obterFFmpeg(): Promise<FFmpegInstance> {
  if (ffmpegPromise) return ffmpegPromise;
  ffmpegPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    // Em apps Vite, o worker do @ffmpeg/ffmpeg é resolvido via
    // `new URL("./worker.js", import.meta.url)`, o que costuma falhar no
    // bundle (worker fica preso, a barra trava em 0%). Passando o
    // `classWorkerURL` explicitamente — junto do core ESM — o WASM inicia.
    const coreBase =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
    const workerBase =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm";
    const ffmpeg = new FFmpeg();
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${coreBase}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${coreBase}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
        classWorkerURL: await toBlobURL(
          `${workerBase}/worker.js`,
          "text/javascript",
        ),
      });
    } catch (e) {
      ffmpegPromise = null;
      throw new Error(
        "Não foi possível carregar o conversor de vídeo (FFmpeg). Verifique sua conexão e tente novamente. Detalhe: " +
          (e instanceof Error ? e.message : String(e)),
      );
    }
    return ffmpeg;
  })();
  return ffmpegPromise;
}

/** Converte um Blob em string base64 (data URL). */
export function blobParaBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Falha ao ler o vídeo."));
    fr.readAsDataURL(blob);
  });
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

/** Desenha o quadro (fundo borrado + imagem centralizada) no canvas. */
export function desenharQuadro(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
) {
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
}

export type FonteAudio =
  | { tipo: "sequencia"; urls: string[] }
  | { tipo: "primeiro"; urls: string[] }
  | { tipo: "unico"; urls: string[] }
  | { tipo: "nenhum" };

/** Decide quais URLs de áudio usar para a obra, conforme a escolha. */
export function montarFonteAudio(
  obra: Pick<ObraAcervo, "audioTrechos" | "audioFem" | "audio" | "audioMasc">,
  escolha: "sequencia" | "primeiro" = "sequencia",
): FonteAudio {
  const trechosUrls = (obra.audioTrechos ?? []).map((t) => t.url);
  const unicoUrl = obra.audioFem ?? obra.audio ?? obra.audioMasc ?? null;
  if (trechosUrls.length > 0) {
    if (escolha === "primeiro") {
      return { tipo: "primeiro", urls: [trechosUrls[0]] };
    }
    return { tipo: "sequencia", urls: trechosUrls };
  }
  if (unicoUrl) return { tipo: "unico", urls: [unicoUrl] };
  return { tipo: "nenhum" };
}

/** Indica se a obra tem mídia suficiente (imagem + algum áudio) para gerar. */
export function obraApta(obra: ObraAcervo): boolean {
  const temImagem = Boolean(obra.imagem);
  const temAudio =
    (obra.audioTrechos?.length ?? 0) > 0 ||
    Boolean(obra.audioFem ?? obra.audio ?? obra.audioMasc);
  return temImagem && temAudio;
}

export type EtapaGeracao =
  | "imagem"
  | "audio"
  | "ffmpeg"
  | "encode"
  | "finalizando";

export interface OpcoesGeracao {
  canvas: HTMLCanvasElement;
  escolha?: "sequencia" | "primeiro";
  /** Progresso de 0 a 100 durante a fase de encode do ffmpeg. */
  onProgress?: (pct: number) => void;
  /** Etapa atual da geração, para feedback ao usuário. */
  onEtapa?: (etapa: EtapaGeracao) => void;
}


/**
 * Monta o reels (MP4) de uma obra inteiramente no navegador: desenha a imagem,
 * concatena o áudio e encoda com o ffmpeg. Retorna o Blob do MP4.
 */
export async function gerarReelsDaObra(
  obra: ObraAcervo,
  { canvas, escolha = "sequencia", onProgress }: OpcoesGeracao,
): Promise<Blob> {
  const fonte = montarFonteAudio(obra, escolha);
  if (fonte.tipo === "nenhum") {
    throw new Error("Esta obra não tem áudio gerado.");
  }
  if (!obra.imagem) {
    throw new Error("Esta obra não tem imagem.");
  }

  // 1. Carrega a imagem.
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    el.src = obra.imagem as string;
  });

  // 2. Renderiza o quadro uma única vez e exporta como PNG.
  canvas.width = LARGURA;
  canvas.height = ALTURA;
  const ctx = canvas.getContext("2d")!;
  desenharQuadro(ctx, img);
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
  onProgress?.(0);
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await obterFFmpeg();
  const handler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.max(0, Math.min(100, Math.round(progress * 100))));
  };
  ffmpeg.on("progress", handler);

  try {
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

    const dados = await ffmpeg.readFile("out.mp4");
    const bytes =
      dados instanceof Uint8Array
        ? dados
        : new TextEncoder().encode(String(dados));
    const mp4Ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(mp4Ab).set(bytes);
    onProgress?.(100);
    return new Blob([mp4Ab], { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", handler);
    // Limpa os arquivos para reutilizar a instância entre obras.
    try {
      await ffmpeg.deleteFile("frame.png");
      await ffmpeg.deleteFile("audio.wav");
      await ffmpeg.deleteFile("out.mp4");
    } catch {
      // ignora se algum arquivo não existir
    }
  }
}
