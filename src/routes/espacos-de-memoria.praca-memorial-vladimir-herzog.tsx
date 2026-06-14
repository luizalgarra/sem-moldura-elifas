import { createFileRoute } from "@tanstack/react-router";

const ancoras = [
  { id: "vlado-vitorioso", titulo: "Vlado Vitorioso" },
  { id: "mosaico-25-de-outubro", titulo: "Mosaico 25 de Outubro" },
  { id: "calcadao-do-reconhecimento", titulo: "Calçadão do Reconhecimento" },
  { id: "espaco-cultural-a-ceu-aberto", titulo: "Espaço Cultural a Céu Aberto" },
];

export const Route = createFileRoute("/espacos-de-memoria/praca-memorial-vladimir-herzog")({
  head: () => ({
    meta: [{ title: "Praça Memorial Vladimir Herzog — Espaços de Memória" }],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        Praça Memorial Vladimir Herzog
      </h1>
      <nav aria-label="Seções da página" className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          {ancoras.map((a) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className="text-accent hover:underline">
                {a.titulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8 space-y-12">
        {ancoras.map((a) => (
          <section key={a.id} id={a.id} className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-bold text-foreground">{a.titulo}</h2>
            <p className="mt-2 text-muted-foreground">
              Conteúdo em preparação. Esta seção estará disponível em breve.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
