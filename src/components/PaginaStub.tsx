import { Link } from "@tanstack/react-router";
import type { GrupoNav } from "@/data/navegacao";

export function PaginaStub({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        {titulo}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {descricao ?? "Conteúdo em preparação. Esta página estará disponível em breve."}
      </p>
    </div>
  );
}

export function IndiceSecao({ grupo }: { grupo: GrupoNav }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        {grupo.rotulo}
      </h1>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {grupo.itens.map((item) => (
          <li key={item.para}>
            <Link
              to={item.para}
              className="block rounded-lg border border-border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="font-medium text-foreground">{item.rotulo}</span>
              {item.descricao && (
                <span className="mt-1 block text-sm text-muted-foreground">
                  {item.descricao}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
