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
            Realização Instituto Elifas Andreato · Patrocínio Caixa / Governo do
            Brasil
          </p>
          <p className="mt-2 leading-relaxed">
            Caixa Cultural São Paulo · Praça da Sé, 111 — Centro · 27/06 a
            20/09/2026 · ter–dom 9h–18h · Entrada franca.
          </p>
        </div>
      </div>

      {/* Faixa clara de selos institucionais */}
      <div className="bg-foreground py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4">
          {SELOS.map((selo) => (
            <img
              key={selo.alt}
              src={selo.src}
              alt={selo.alt}
              className="h-10 w-auto object-contain"
            />
          ))}
          {/* Selo do Instituto é branco → chip escuro */}
          <span className="inline-flex items-center rounded-md bg-background px-3 py-2">
            <img
              src={marca.seloInstitutoElifas}
              alt="Instituto Elifas Andreato"
              className="h-9 w-auto object-contain"
            />
          </span>
          <img
            src={marca.iconeClassificacao}
            alt="Classificação indicativa: livre"
            className="h-10 w-auto object-contain"
          />
          <img
            src={marca.iconeAcessibilidade}
            alt="Recursos de acessibilidade disponíveis"
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>
    </footer>
  );
}
