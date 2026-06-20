import { Link } from "@tanstack/react-router";
import { marca } from "@/assets/marca";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
        <img
          src={marca.logoFirmaBranco}
          alt="Elifas Andreato — Além da Moldura"
          className="h-10 w-auto"
          width={150}
          height={40}
        />
        <p className="mt-3 max-w-prose">
          Catálogo virtual da exposição. Acesse cada obra pelo QR Code impresso e
          navegue livremente pelo acervo, com áudio-descrição em todas as obras.
        </p>

        <nav aria-label="Rodapé" className="mt-4">
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link to="/sobre" className="hover:text-accent">
                Sobre a exposição
              </Link>
            </li>
            <li>
              <Link to="/obras" className="hover:text-accent">
                Acervo
              </Link>
            </li>
            <li>
              <Link to="/linhas-da-vida" className="hover:text-accent">
                Linhas da Vida
              </Link>
            </li>
            <li>
              <Link to="/como-usar" className="hover:text-accent">
                Como usar
              </Link>
            </li>
            <li>
              <Link to="/qrcodes" className="hover:text-accent">
                QR Codes
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-accent">
                Privacidade e Segurança
              </Link>
            </li>
          </ul>
        </nav>

        {/* Informações da exposição */}
        <div className="mt-8 border-t border-border pt-6 text-foreground/80">
          <p className="font-semibold text-foreground">
            Caixa Cultural São Paulo · Praça da Sé, 111 — Centro
          </p>
          <p className="mt-2 leading-relaxed">
            27/06 a 20/09/2026 · ter–dom 9h–18h · Entrada franca.
          </p>
          <div className="mt-4 flex items-center gap-3" aria-hidden="false">
            <img
              src={marca.iconeAcessibilidade}
              alt="Recursos de acessibilidade disponíveis (áudio-descrição)"
              className="h-8 w-auto object-contain"
            />
            <img
              src={marca.iconeClassificacao}
              alt="Classificação indicativa: 12 anos"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Assinatura institucional — barras fiéis ao cartaz */}
      <div className="border-t border-border bg-black py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 px-4 sm:flex-row sm:justify-between">
          <img
            src={marca.barraRealizacao}
            alt="Realização: Tem patrocínio, tem Governo do Brasil · Instituto Elifas Andreato"
            className="h-auto w-full max-w-xs object-contain"
          />
          <img
            src={marca.barraPatrocinio}
            alt="Patrocínio: Caixa · Governo do Brasil, do lado do povo brasileiro"
            className="h-auto w-full max-w-xs object-contain"
          />
        </div>
      </div>
    </footer>
  );
}
