import { Link } from "@tanstack/react-router";
import { ControlesAcessibilidade } from "@/components/ControlesAcessibilidade";
import { marca } from "@/assets/marca";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={marca.barraCaixaCulturalApresenta}
            alt="Caixa Cultural apresenta"
            className="h-10 w-auto border-r border-border pr-3 sm:h-12"
          />
          <Link
            to="/"
            className="flex items-center gap-3 focus-visible:outline-none"
            aria-label="Página inicial · Elifas Andreato — Além da Moldura"
          >
            <img
              src={marca.logoFirmaBranco}
              alt="Elifas Andreato — Além da Moldura"
              className="h-9 w-auto sm:h-11"
              width={160}
              height={44}
            />
            <span className="hidden text-xs uppercase tracking-widest text-brand-yellow sm:block">
              Além da Moldura · 80 anos
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <nav aria-label="Navegação principal" className="hidden sm:block">
            <ul className="flex items-center gap-4 text-sm font-medium text-foreground">
              <li>
                <Link to="/obras" className="hover:text-accent" activeProps={{ className: "text-accent" }}>
                  Acervo
                </Link>
              </li>
              <li>
                <Link to="/como-usar" className="hover:text-accent" activeProps={{ className: "text-accent" }}>
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
