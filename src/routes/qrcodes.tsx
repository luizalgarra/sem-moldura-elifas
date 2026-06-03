import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { obras } from "@/data/obras";
import { QrCode } from "@/components/QrCode";

export const Route = createFileRoute("/qrcodes")({
  head: () => ({
    meta: [
      { title: "QR Codes — Elifas Andreato: Sem Moldura" },
      {
        name: "description",
        content:
          "Página utilitária com os QR Codes de todas as obras para impressão na exposição.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QrCodes,
});

function QrCodes() {
  const [origem, setOrigem] = useState("");

  useEffect(() => {
    setOrigem(window.location.origin);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6 print:mb-4">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          QR Codes das obras
        </h1>
        <p className="mt-2 text-muted-foreground print:hidden">
          Página de apoio para imprimir os QR Codes. Cada código leva direto à
          página da obra. Use o recurso de impressão do navegador.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {obras.map((obra) => {
          const url = origem ? `${origem}/obras/${obra.num}` : `/obras/${obra.num}`;
          return (
            <div
              key={obra.num}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center"
            >
              {origem && (
                <QrCode
                  valor={url}
                  tamanho={150}
                  rotulo={`QR Code da obra ${obra.num}: ${obra.titulo}`}
                />
              )}
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Obra {obra.num}
              </p>
              <p className="line-clamp-2 font-serif text-sm font-semibold text-card-foreground">
                {obra.titulo}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
