import { createFileRoute } from "@tanstack/react-router";
import { QrCode as QrIcon, Headphones, Contrast, Type, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/como-usar")({
  head: () => ({
    meta: [
      { title: "Como usar — Elifas Andreato: Além da Moldura" },
      {
        name: "description",
        content:
          "Como usar o catálogo virtual: leitura do QR Code, áudio-descrição e recursos de acessibilidade.",
      },
    ],
  }),
  component: ComoUsar,
});

function Passo({
  icone: Icone,
  titulo,
  children,
}: {
  icone: typeof QrIcon;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Icone className="size-7 text-accent" aria-hidden="true" />
      <h2 className="mt-3 font-serif text-xl font-semibold text-card-foreground">{titulo}</h2>
      <div className="mt-2 text-muted-foreground">{children}</div>
    </div>
  );
}

function ComoUsar() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        Como usar o catálogo
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tudo funciona pelo celular, sem instalar nada e sem fazer cadastro.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Passo icone={QrIcon} titulo="1. Leia o QR Code">
          Aponte a câmera do celular para o QR Code que está ao lado de cada obra
          na exposição. O catálogo abre direto na obra correspondente.
        </Passo>
        <Passo icone={Headphones} titulo="2. Ouça a áudio-descrição">
          Na página da obra, toque em <strong>Ouvir</strong> para escutar a
          descrição em voz. É possível pausar, parar e ajustar a velocidade.
        </Passo>
        <Passo icone={LayoutGrid} titulo="3. Navegue pelo acervo">
          Use os botões <strong>Anterior</strong> e <strong>Próxima</strong> ou
          volte ao acervo para explorar todas as obras na ordem da exposição.
        </Passo>
        <Passo icone={Type} titulo="4. Ajuste o texto">
          No topo da tela, aumente ou diminua o tamanho do texto com os botões
          <strong> + </strong> e <strong> − </strong>.
        </Passo>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-secondary/40 p-6">
        <div className="flex items-center gap-2">
          <Contrast className="size-6 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Acessibilidade
          </h2>
        </div>
        <p className="mt-2 text-muted-foreground">
          O catálogo tem modo de <strong>alto contraste</strong>, ajuste do
          tamanho do texto, navegação por teclado e descrições em todas as
          imagens. Os controles ficam sempre no topo da tela.
        </p>
      </div>
    </div>
  );
}
