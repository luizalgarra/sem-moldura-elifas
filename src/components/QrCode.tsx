import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QrCodeProps {
  valor: string;
  tamanho?: number;
  rotulo?: string;
}

export function QrCode({ valor, tamanho = 160, rotulo }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(
      canvas,
      valor,
      { width: tamanho, margin: 1, color: { dark: "#2a1a12", light: "#ffffff" } },
      (e) => {
        if (e) setErro(true);
      },
    );
  }, [valor, tamanho]);

  if (erro) {
    return (
      <span className="text-xs text-muted-foreground">Não foi possível gerar o QR Code</span>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={rotulo ?? `QR Code para ${valor}`}
      className="rounded bg-white"
    />
  );
}
