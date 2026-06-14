import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/instituto/pilares")({
  head: () => ({ meta: [{ title: "Pilares — O Instituto" }] }),
  component: () => (
    <PaginaStub titulo="Pilares" descricao="Preservação, Difusão e Ação Educativa." />
  ),
});
