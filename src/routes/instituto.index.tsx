import { createFileRoute } from "@tanstack/react-router";
import { IndiceSecao } from "@/components/PaginaStub";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/instituto")!;

export const Route = createFileRoute("/instituto/")({
  head: () => ({ meta: [{ title: "O Instituto — Elifas Andreato" }] }),
  component: () => <IndiceSecao grupo={grupo} />,
});
