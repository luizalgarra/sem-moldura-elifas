import { Link } from "@tanstack/react-router";
import { ControlesAcessibilidade } from "@/components/ControlesAcessibilidade";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="flex flex-col leading-tight focus-visible:outline-none"
          aria-label="Página inicial do catálogo"
        >
          <span className="font-serif text-lg font-bold text-foreground">
            Elifas Andreato
          </span>
          <span className="text-xs uppercase tracking-widest text-primary">
            Sem Moldura · 80 anos
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <nav aria-label="Navegação principal" className="hidden sm:block">
            <ul className="flex items-center gap-4 text-sm font-medium">
              <li>
                <Link to="/obras" className="hover:text-primary" activeProps={{ className: "text-primary" }}>
                  Acervo
                </Link>
              </li>
              <li>
                <Link to="/como-usar" className="hover:text-primary" activeProps={{ className: "text-primary" }}>
                  Como usar
                </Link>
              </li>
            </ul>
          </nav>
          <ControlesAcessibilidade />
        </div>
      </div>
    </header>
  );
}
