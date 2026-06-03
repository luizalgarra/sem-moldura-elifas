import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import { obras } from "@/data/obras";
import { Button } from "@/components/ui/button";

export function NavegacaoSequencial({ num }: { num: number }) {
  const indice = obras.findIndex((o) => o.num === num);
  const anterior = indice > 0 ? obras[indice - 1] : null;
  const proxima = indice >= 0 && indice < obras.length - 1 ? obras[indice + 1] : null;

  return (
    <nav className="flex flex-col gap-3" aria-label="Navegação entre obras">
      <p className="text-center text-sm text-muted-foreground">
        Obra {indice + 1} de {obras.length}
      </p>
      <div className="flex items-center justify-between gap-3">
        {anterior ? (
          <Button asChild variant="outline" className="min-h-11 flex-1 justify-start">
            <Link to="/obras/$num" params={{ num: String(anterior.num) }}>
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
            <Link to="/obras/$num" params={{ num: String(proxima.num) }}>
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
