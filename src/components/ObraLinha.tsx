import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import type { Obra } from "@/data/obras";

export function ObraLinha({ obra }: { obra: Obra }) {
  return (
    <Link
      to="/obras/$num"
      params={{ num: String(obra.num) }}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {obra.imagem ? (
          <img
            src={obra.imagem}
            alt={`Obra ${obra.num}: ${obra.titulo}, de Elifas Andreato, ${obra.ano}.`}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-5" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-yellow">
          Obra {obra.num}
        </p>
        <h3 className="truncate font-semibold leading-tight text-card-foreground transition-colors group-hover:text-accent">
          {obra.titulo}
        </h3>
        <p className="truncate text-sm text-muted-foreground">
          {obra.ano}
          {obra.tecnica ? ` · ${obra.tecnica}` : ""}
        </p>
      </div>
    </Link>
  );
}
