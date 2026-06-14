import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/instituto/missao-e-legado")({
  head: () => ({ meta: [{ title: "Missão e Legado — O Instituto" }] }),
  component: () => <PaginaStub titulo="Missão e Legado" />,
});
