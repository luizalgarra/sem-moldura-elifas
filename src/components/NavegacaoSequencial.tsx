import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Navegação entre obras pela POSIÇÃO exibida (sequência contígua 1..total).
 */
export function NavegacaoSequencial({
  num,
  total,
}: {
  num: number;
  total: number;
}) {
  const anterior = num > 1 ? num - 1 : null;
  const proxima = num < total ? num + 1 : null;

  return (
    <nav className="flex flex-col gap-3" aria-label="Navegação entre obras">
      <p className="text-center text-sm text-muted-foreground">
        Obra {num} de {total}
      </p>
      <div className="flex items-center justify-between gap-3">
        {anterior ? (
          <Button asChild variant="outline" className="min-h-11 flex-1 justify-start">
            <Link to="/obras/$num" params={{ num: String(anterior) }}>
              <ArrowLeft aria-hidden="true" />
              <span className="truncate">Anterior</span>
            </Link>
          </Button>
        ) : (
          <span className="flex-1" />
        )}

        <Button asChild variant="ghost" size="icon" className="min-h-11 min-w-11">
          <Link to="/obras" aria-label="Voltar ao acervo">
            <LayoutGrid aria-hidden="true" />
          </Link>
        </Button>

        {proxima ? (
          <Button asChild variant="outline" className="min-h-11 flex-1 justify-end">
            <Link to="/obras/$num" params={{ num: String(proxima) }}>
              <span className="truncate">Próxima</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <span className="flex-1" />
        )}
      </div>
    </nav>
  );
}
