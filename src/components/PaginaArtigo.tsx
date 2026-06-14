export function PaginaArtigo({
  titulo,
  paragrafos,
}: {
  titulo: string;
  paragrafos: string[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        {titulo}
      </h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        {paragrafos.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
