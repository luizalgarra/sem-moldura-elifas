import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Loader2 } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AcessibilidadeProvider } from "../hooks/useAcessibilidade";
import { AdminAuthProvider, useAdminAuth } from "../hooks/useAdminAuth";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { marca } from "../assets/marca";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente atualizar ou volte para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Elifas Andreato — Além da Moldura · Catálogo Virtual" },
      {
        name: "description",
        content:
          "Catálogo virtual da exposição 80 anos de Elifas Andreato: Além da Moldura. Obras com áudio-descrição e acesso por QR Code.",
      },
      { name: "author", content: "Elifas Andreato" },
      { property: "og:title", content: "Elifas Andreato — Além da Moldura" },
      {
        property: "og:description",
        content:
          "Catálogo virtual da exposição 80 anos de Elifas Andreato: Além da Moldura, com áudio-descrição e acesso por QR Code.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Elifas Andreato — Além da Moldura" },
      { property: "og:image", content: `https://sem-moldura-elifas.lovable.app${marca.ogImage}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Elifas Andreato — Além da Moldura" },
      {
        name: "twitter:description",
        content:
          "Catálogo virtual da exposição 80 anos de Elifas Andreato: Além da Moldura.",
      },
      { name: "twitter:image", content: `https://sem-moldura-elifas.lovable.app${marca.ogImage}` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: marca.favicon },
      { rel: "apple-touch-icon", href: marca.favicon },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AcessibilidadeProvider>
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Pular para o conteúdo
          </a>
          <Conteudo />
        </AcessibilidadeProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

function Conteudo() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { carregando, session, isAdmin, sair } = useAdminAuth();

  // A home ("/") usa o layout completo do site (cabeçalho e rodapé).
  const emConstrucao = false;
  // A tela de login é pública e não usa o layout interno.
  const ehAuth = pathname === "/auth";

  // Apenas as áreas administrativas exigem login. As demais páginas de
  // conteúdo são públicas e visíveis a qualquer visitante.
  const protegida =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/editar") ||
    pathname.startsWith("/postar") ||
    pathname.startsWith("/qrcodes");

  const semSessao = protegida && !carregando && !session;

  // Redireciona para o login fora da renderização (evita aviso do React).
  useEffect(() => {
    if (semSessao) {
      router.navigate({ to: "/auth" });
    }
  }, [semSessao, router]);

  if (protegida) {
    if (carregando || !session) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Acesso restrito
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua conta não tem permissão para acessar esta área.
            </p>
            <div className="mt-6">
              <button
                onClick={() => sair()}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  const mostrarLayout = !emConstrucao && !ehAuth;

  return (
    <div className="flex min-h-screen flex-col">
      {mostrarLayout && <SiteHeader onSair={() => sair()} />}
      <main id="conteudo" className="flex-1">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>
      {mostrarLayout && <SiteFooter />}
    </div>
  );
}
