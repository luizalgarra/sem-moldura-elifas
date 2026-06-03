import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
        <p className="font-serif text-base text-foreground">
          80 anos de Elifas Andreato: Sem Moldura
        </p>
        <p className="mt-2 max-w-prose">
          Catálogo virtual da exposição. Acesse cada obra pelo QR Code impresso e
          navegue livremente pelo acervo, com áudio-descrição em todas as obras.
        </p>
        <nav aria-label="Rodapé" className="mt-4">
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link to="/obras" className="hover:text-primary">
                Acervo
              </Link>
            </li>
            <li>
              <Link to="/como-usar" className="hover:text-primary">
                Como usar
              </Link>
            </li>
            <li>
              <Link to="/qrcodes" className="hover:text-primary">
                QR Codes
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
