import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { ControlesAcessibilidade } from "@/components/ControlesAcessibilidade";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { navegacao } from "@/data/navegacao";
import { marca } from "@/assets/marca";

export function SiteHeader({ onSair }: { onSair?: () => void }) {
  const [menuAberto, setMenuAberto] = useState(false);

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
            <span className="hidden text-xs uppercase tracking-widest text-brand-yellow lg:block">
              Além da Moldura · 80 anos
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Navegação desktop com menus suspensos */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navegacao.map((grupo) => (
                <NavigationMenuItem key={grupo.para}>
                  <NavigationMenuTrigger className="bg-transparent text-foreground hover:text-accent data-[state=open]:text-accent">
                    {grupo.rotulo}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-64 gap-1 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to={grupo.para}
                            className="block rounded-md px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            Ver tudo
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {grupo.itens.map((item) => (
                        <li key={item.para}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.para}
                              className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                              activeProps={{ className: "bg-accent text-accent-foreground" }}
                            >
                              <span className="font-medium">{item.rotulo}</span>
                              {item.descricao && (
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  {item.descricao}
                                </span>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <ControlesAcessibilidade />

          {onSair && (
            <button
              type="button"
              onClick={onSair}
              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              aria-label="Sair"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}

          {/* Navegação mobile colapsável */}
          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-foreground transition-colors hover:bg-accent lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <nav aria-label="Navegação principal" className="mt-8">
                <ul className="space-y-6">
                  {navegacao.map((grupo) => (
                    <li key={grupo.para}>
                      <SheetClose asChild>
                        <Link
                          to={grupo.para}
                          className="block text-sm font-semibold uppercase tracking-wide text-foreground hover:text-accent"
                          activeProps={{ className: "text-accent" }}
                        >
                          {grupo.rotulo}
                        </Link>
                      </SheetClose>
                      <ul className="mt-2 space-y-1 border-l border-border pl-3">
                        {grupo.itens.map((item) => (
                          <li key={item.para}>
                            <SheetClose asChild>
                              <Link
                                to={item.para}
                                className="block py-1 text-sm text-muted-foreground hover:text-accent"
                                activeProps={{ className: "text-accent" }}
                              >
                                {item.rotulo}
                              </Link>
                            </SheetClose>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
