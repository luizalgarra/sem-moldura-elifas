import { createFileRoute } from "@tanstack/react-router";
import { IndiceSecao } from "@/components/PaginaStub";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/elifas-andreato")!;

export const Route = createFileRoute("/elifas-andreato/")({
  head: () => ({ meta: [{ title: "Elifas Andreato" }] }),
  component: () => <IndiceSecao grupo={grupo} />,
});
