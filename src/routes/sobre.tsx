import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Exposição — Elifas Andreato: Além da Moldura" },
      {
        name: "description",
        content:
          "A CAIXA Cultural São Paulo apresenta \u201cElifas Andreato — Além da Moldura\u201d, exposição que homenageia um dos principais artistas gráficos do Brasil.",
      },
      { property: "og:title", content: "Sobre a Exposição — Elifas Andreato" },
      {
        property: "og:description",
        content:
          "Conheça a exposição \u201cElifas Andreato — Além da Moldura\u201d, na CAIXA Cultural São Paulo.",
      },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        Sobre a Exposição
      </h1>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p className="text-lg text-foreground sm:text-xl">
          A CAIXA Cultural São Paulo apresenta “Elifas Andreato — Além da
          Moldura”, uma exposição que homenageia um dos principais artistas
          gráficos do Brasil. Suas icônicas capas de discos marcaram de forma
          singular a memória visual do país.
        </p>

        <p className="text-muted-foreground">
          Ao traduzir em imagens a força da música popular brasileira, Elifas
          deu identidade visual a trabalhos de nomes como Elis Regina, Paulinho
          da Viola, Chico Buarque, Martinho da Vila e Clara Nunes. Artista
          múltiplo, Elifas transitou por diferentes linguagens e suportes,
          sempre com um olhar atento ao Brasil e ao seu povo.
        </p>

        <p className="text-muted-foreground">
          A trajetória do artista foi marcada pela profunda inspiração na
          cultura nacional e por seu engajamento na educação, nas artes e nos
          direitos humanos, com atenção especial à infância. Ao longo de 50
          anos, construiu um percurso que aliou criação artística e consciência
          social, refletindo a diversidade cultural do país e o enfrentamento
          das desigualdades.
        </p>

        <p className="text-muted-foreground">
          Ao patrocinar a exposição, a CAIXA reafirma seu compromisso com a
          cultura brasileira, apoiando iniciativas que ampliam o acesso à arte,
          preservam a memória e fortalecem a conexão dos brasileiros com sua
          identidade e sua história. Assim como Elifas Andreato retratou o país
          com sensibilidade, a CAIXA segue promovendo e inspirando o encontro do
          público com a riqueza cultural do Brasil.
        </p>
      </div>
    </div>
  );
}
