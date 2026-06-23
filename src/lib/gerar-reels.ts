import type { ObraAcervo } from "@/lib/admin-obras.functions";

export const LARGURA = 720;
export const ALTURA = 1280;

type FFmpegInstance = import("@ffmpeg/ffmpeg").FFmpeg;
let ffmpegPromise: Promise<FFmpegInstance> | null = null;

/** Baixa um arquivo local e devolve uma blob URL com o mimeType indicado. */
async function arquivoLocalParaBlobURL(
  url: string,
  mimeType: string,
): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Falha ao baixar ${url} (HTTP ${resp.status}).`);
  }
  const blob = await resp.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

/** Baixa o WASM compactado (.gz) e descompacta no navegador. */
async function carregarWasmLocal(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok || !resp.body) {
    throw new Error(`Falha ao baixar o WASM (HTTP ${resp.status}).`);
  }
  const fluxo = resp.body.pipeThrough(new DecompressionStream("gzip"));
  const bytes = await new Response(fluxo).arrayBuffer();
  return URL.createObjectURL(
    new Blob([bytes], { type: "application/wasm" }),
  );
}

/** Carrega (uma única vez) a instância do ffmpeg em WebAssembly. */
export async function obterFFmpeg(): Promise<FFmpegInstance> {
  if (ffmpegPromise) return ffmpegPromise;
  ffmpegPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    // Tudo é servido localmente (public/ffmpeg), sem depender de CDN externo,
    // evitando o travamento intermitente na inicialização do conversor.
    const ffmpeg = new FFmpeg();
    try {
      const [coreURL, wasmURL, classWorkerURL] = await Promise.all([
        arquivoLocalParaBlobURL("/ffmpeg/ffmpeg-core.js", "text/javascript"),
        carregarWasmLocal("/ffmpeg/ffmpeg-core.wasm.bin"),
        arquivoLocalParaBlobURL("/ffmpeg/worker.js", "text/javascript"),
      ]);

      // Timeout de segurança: se o WASM não inicializar, falha com mensagem
      // clara em vez de ficar preso para sempre.
      const carregar = ffmpeg.load({ coreURL, wasmURL, classWorkerURL });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Tempo esgotado ao iniciar o conversor (60s).")),
          60_000,
        ),
      );
      await Promise.race([carregar, timeout]);
    } catch (e) {
      ffmpegPromise = null;
      throw new Error(
        "Não foi possível carregar o conversor de vídeo (FFmpeg). Tente novamente. Detalhe: " +
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
  { canvas, escolha = "sequencia", onProgress, onEtapa }: OpcoesGeracao,
): Promise<Blob> {
  const fonte = montarFonteAudio(obra, escolha);
  if (fonte.tipo === "nenhum") {
    throw new Error("Esta obra não tem áudio gerado.");
  }
  if (!obra.imagem) {
    throw new Error("Esta obra não tem imagem.");
  }
  if (!canvas) {
    throw new Error("Canvas indisponível para a montagem do vídeo.");
  }

  // 1. Carrega a imagem.
  onEtapa?.("imagem");
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () =>
      reject(
        new Error(
          "Falha ao carregar a imagem da obra (verifique se a imagem existe).",
        ),
      );
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
  onEtapa?.("audio");
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioCtx = new AudioCtx();
  const buffers: AudioBuffer[] = [];
  for (const url of fonte.urls) {
    const resp = await fetch(url);
    if (!resp.ok) {
      await audioCtx.close();
      throw new Error("Falha ao baixar o áudio da obra.");
    }
    const arr = await resp.arrayBuffer();
    const buf = await audioCtx.decodeAudioData(arr);
    buffers.push(buf);
  }
  await audioCtx.close();

  const audioFinal = await concatenarAudios(buffers);
  const wav = audioBufferParaWav(audioFinal);

  // 4. Encoda o MP4 direto no ffmpeg (imagem em loop + áudio).
  onEtapa?.("ffmpeg");
  onProgress?.(0);
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await obterFFmpeg();
  onEtapa?.("encode");
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

    onEtapa?.("finalizando");
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
