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
              <Link to="/obras" className="hover:text-accent">
                Acervo
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

      {/* Assinatura institucional — fiel ao cartaz (fundo escuro) */}
      <div className="border-t border-border bg-background py-8">
        {/* Apresentação */}
        <div className="mx-auto mb-8 flex max-w-5xl items-center justify-center gap-3 px-4">
          <img
            src={marca.seloCaixaCultural}
            alt="Caixa Cultural"
            className="h-10 w-auto object-contain"
          />
          <span className="text-sm font-medium text-foreground/70">Apresenta</span>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-10 px-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Realização */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Realização
            </span>
            <div className="flex items-center gap-4">
              <img
                src={marca.seloSecom}
                alt="Tem patrocínio, tem Governo do Brasil"
                className="h-12 w-auto object-contain"
              />
              <img
                src={marca.seloInstitutoElifas}
                alt="Instituto Elifas Andreato"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          {/* Patrocínio */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Patrocínio
            </span>
            <div className="flex items-center gap-5">
              <img
                src={marca.seloCaixa}
                alt="Caixa"
                className="h-7 w-auto object-contain"
              />
              <img
                src={marca.seloGovernoBrasil}
                alt="Governo do Brasil"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
