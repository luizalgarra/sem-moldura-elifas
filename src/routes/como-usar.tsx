import { createFileRoute } from "@tanstack/react-router";
import { QrCode as QrIcon, Headphones, Contrast, Type, LayoutGrid, Smartphone } from "lucide-react";

/** O glifo de compartilhar do iOS. O ícone do lucide é outro desenho, e aqui a
 *  pessoa precisa reconhecer exatamente o que vai ver na barra do Safari. */
function IconeCompartilharIos({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`inline h-[1.1em] w-[1.1em] -translate-y-[1px] align-middle text-accent ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M12 3l-3.5 3.5M12 3l3.5 3.5" />
      <path d="M7 10H5.5A1.5 1.5 0 0 0 4 11.5v8A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 18.5 10H17" />
    </svg>
  );
}

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
        Tudo funciona pelo celular, sem baixar aplicativo e sem fazer cadastro.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Passo icone={QrIcon} titulo="1. Leia o QR Code">
          Aponte a câmera do celular para o QR Code que está ao lado de cada obra na exposição. O
          catálogo abre direto na obra correspondente.
        </Passo>
        <Passo icone={Headphones} titulo="2. Ouça a áudio-descrição">
          Na página da obra, toque em <strong>Ouvir</strong> para escutar a descrição em voz. É
          possível pausar, parar e ajustar a velocidade.
        </Passo>
        <Passo icone={LayoutGrid} titulo="3. Navegue pelo acervo">
          Use os botões <strong>Anterior</strong> e <strong>Próxima</strong> ou volte ao acervo para
          explorar todas as obras na ordem da exposição.
        </Passo>
        <Passo icone={Type} titulo="4. Ajuste o texto">
          No topo da tela, aumente ou diminua o tamanho do texto com os botões
          <strong> + </strong> e <strong> − </strong>.
        </Passo>
      </div>

      <section className="mt-8 rounded-lg border border-border bg-secondary/40 p-6">
        <div className="flex items-center gap-2">
          <Smartphone className="size-6 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Leve o catálogo com você
          </h2>
        </div>
        <p className="mt-2 text-muted-foreground">
          Dá para guardar o catálogo na tela de início do celular. Ele passa a abrir como um
          aplicativo, sem a barra do navegador, e as obras que você já visitou continuam disponíveis
          mesmo sem internet — útil quando o sinal falha dentro da exposição.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-foreground">No iPhone</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Toque em <IconeCompartilharIos />{" "}
                <strong className="font-semibold">Compartilhar</strong>, na parte de baixo da tela
              </li>
              <li>
                Role a lista e escolha{" "}
                <strong className="font-semibold">Adicionar à Tela de Início</strong>
              </li>
              <li>
                Toque em <strong className="font-semibold">Adicionar</strong>, no canto superior
                direito
              </li>
            </ol>
            <p className="mt-3 border-l-2 border-accent pl-3 text-sm text-muted-foreground">
              Se você abriu este site por dentro do Instagram, do WhatsApp ou de outro aplicativo,
              essa opção não aparece. Toque nos três pontinhos e escolha{" "}
              <strong className="font-semibold">Abrir no Safari</strong> antes de tentar.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">No Android</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
              <li>
                Toque em <strong className="font-semibold">Instalar</strong> quando o convite
                aparecer na tela
              </li>
              <li>
                Ou abra o menu do navegador e escolha{" "}
                <strong className="font-semibold">Instalar aplicativo</strong>
              </li>
            </ol>
            <p className="mt-3 border-l-2 border-accent pl-3 text-sm text-muted-foreground">
              Nada é baixado da loja de aplicativos. O catálogo continua sendo um site — só ganha um
              ícone próprio no seu celular.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 rounded-lg border border-border bg-secondary/40 p-6">
        <div className="flex items-center gap-2">
          <Contrast className="size-6 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-xl font-semibold text-foreground">Acessibilidade</h2>
        </div>
        <p className="mt-2 text-muted-foreground">
          O catálogo tem modo de <strong>alto contraste</strong>, ajuste do tamanho do texto,
          navegação por teclado e descrições em todas as imagens. Os controles ficam sempre no topo
          da tela.
        </p>
      </div>
    </div>
  );
}
