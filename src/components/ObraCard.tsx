import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import type { Obra } from "@/data/obras";

export function ObraCard({ obra }: { obra: Obra }) {
  return (
    <Link
      to="/obras/$num"
      params={{ num: String(obra.num) }}
      className="group block rounded-lg focus-visible:outline-none"
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow group-hover:shadow-md">
        <div className="aspect-square bg-muted">
          {obra.imagem ? (
            <img
              src={obra.imagem}
              alt={`Obra ${obra.num}: ${obra.titulo}, de Elifas Andreato, ${obra.ano}.`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
              <ImageOff className="size-8" aria-hidden="true" />
              <span className="text-xs">Imagem em breve</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Obra {obra.num}
          </p>
          <h3 className="mt-1 line-clamp-2 font-serif text-base font-semibold leading-tight text-card-foreground">
            {obra.titulo}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{obra.ano}</p>
        </div>
      </div>
    </Link>
  );
}
