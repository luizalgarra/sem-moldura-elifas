import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/instituto/rede-de-parceiros")({
  head: () => ({ meta: [{ title: "Rede de Parceiros — O Instituto" }] }),
  component: () => <PaginaStub titulo="Rede de Parceiros" />,
});
