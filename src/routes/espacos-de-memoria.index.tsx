import { createFileRoute } from "@tanstack/react-router";
import { IndiceSecao } from "@/components/PaginaStub";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/espacos-de-memoria")!;

export const Route = createFileRoute("/espacos-de-memoria/")({
  head: () => ({ meta: [{ title: "Espaços de Memória — Elifas Andreato" }] }),
  component: () => <IndiceSecao grupo={grupo} />,
});
