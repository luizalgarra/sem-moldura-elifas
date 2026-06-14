import { createFileRoute } from "@tanstack/react-router";
import { IndiceSecao } from "@/components/PaginaStub";
import { navegacao } from "@/data/navegacao";

const grupo = navegacao.find((g) => g.para === "/participe")!;

export const Route = createFileRoute("/participe/")({
  head: () => ({ meta: [{ title: "Participe — Elifas Andreato" }] }),
  component: () => <IndiceSecao grupo={grupo} />,
});
