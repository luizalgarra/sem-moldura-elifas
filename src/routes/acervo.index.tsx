import { createFileRoute } from "@tanstack/react-router";
import { IndiceSecao } from "@/components/PaginaStub";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/acervo")!;

export const Route = createFileRoute("/acervo/")({
  head: () => ({ meta: [{ title: "Acervo — Elifas Andreato" }] }),
  component: () => <IndiceSecao grupo={grupo} />,
});
