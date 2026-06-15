import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { obras } from "@/data/obras";
import { QrCode } from "@/components/QrCode";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/qrcodes/imprimir")({
  head: () => ({
    meta: [
      { title: "Impressão de QR Codes — Elifas Andreato: Além da Moldura" },
      {
        name: "description",
        content:
          "Selecione as obras e gere um PDF pronto para impressão dos QR Codes (6 por folha A4).",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImprimirQrCodes,
});

const obrasComQr = obras.filter((o) => o.parede !== "Vídeos");

function ImprimirQrCodes() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(
    () => new Set(obrasComQr.map((o) => o.num)),
  );
  const [gerando, setGerando] = useState(false);

  const total = selecionadas.size;

  function alternar(num: number) {
    setSelecionadas((prev) => {
      const proxima = new Set(prev);
      if (proxima.has(num)) proxima.delete(num);
      else proxima.add(num);
      return proxima;
    });
  }

  function selecionarTodas() {
    setSelecionadas(new Set(obras.map((o) => o.num)));
  }

  function limparSelecao() {
    setSelecionadas(new Set());
  }

  async function gerarPdf() {
    const lista = obras.filter((o) => selecionadas.has(o.num));
    if (lista.length === 0) return;

    setGerando(true);
    try {
      const doc = new jsPDF({ format: "a4", unit: "mm" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      const cols = 2;
      const rows = 4;
      const perPage = cols * rows;
      const marginX = 15;
      const marginY = 15;
      const cellW = (pageW - marginX * 2) / cols;
      const cellH = (pageH - marginY * 2) / rows;
      const qrSize = 42; // mm

      for (let i = 0; i < lista.length; i++) {
        const obra = lista[i];
        const indexNaPagina = i % perPage;
        if (i > 0 && indexNaPagina === 0) doc.addPage();

        const col = indexNaPagina % cols;
        const row = Math.floor(indexNaPagina / cols);
        const cellX = marginX + col * cellW;
        const cellY = marginY + row * cellH;
        const centerX = cellX + cellW / 2;

        const dataUrl = await QRCode.toDataURL(`${SITE_URL}/obras/${obra.num}`, {
          margin: 1,
          width: 600,
          color: { dark: "#2a1a12", light: "#ffffff" },
        });

        const qrX = centerX - qrSize / 2;
        const qrY = cellY + 6;
        doc.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize);

        doc.setFontSize(11);
        doc.setTextColor(42, 26, 18);
        const linhas = doc.splitTextToSize(obra.titulo, cellW - 8) as string[];
        const linhasLimitadas = linhas.slice(0, 2);
        doc.text(linhasLimitadas, centerX, qrY + qrSize + 7, {
          align: "center",
        });
      }

      doc.save("qrcodes-obras.pdf");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Impressão de QR Codes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Selecione as obras desejadas e gere um PDF pronto para impressão, com
          8 QR Codes por folha A4. Cada código leva à página da obra (com
          áudio-descrição).
        </p>
        <Link
          to="/qrcodes"
          className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Ver todos os QR Codes
        </Link>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <span className="text-sm font-medium text-card-foreground">
          {total} de {obras.length} selecionadas
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={selecionarTodas}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Selecionar todas
        </button>
        <button
          type="button"
          onClick={limparSelecao}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Limpar seleção
        </button>
        <button
          type="button"
          onClick={gerarPdf}
          disabled={total === 0 || gerando}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {gerando ? "Gerando…" : "Gerar PDF"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {obras.map((obra) => {
          const url = `${SITE_URL}/obras/${obra.num}`;
          const marcada = selecionadas.has(obra.num);
          return (
            <label
              key={obra.num}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${
                marcada
                  ? "border-primary bg-card ring-1 ring-primary"
                  : "border-border bg-card opacity-60 hover:opacity-100"
              }`}
            >
              <input
                type="checkbox"
                checked={marcada}
                onChange={() => alternar(obra.num)}
                className="self-start"
                aria-label={`Selecionar obra ${obra.num}: ${obra.titulo}`}
              />
              <QrCode
                valor={url}
                tamanho={150}
                rotulo={`QR Code da obra ${obra.num}: ${obra.titulo}`}
              />
              <p className="line-clamp-2 font-serif text-sm font-semibold text-card-foreground">
                {obra.titulo}
              </p>
            </label>
          );
        })}
      </div>
    </div>
  );
}
