import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/conservacao-e-restauro")({
  head: () => ({ meta: [{ title: "Conservação e Restauro — Acervo" }] }),
  component: () => <PaginaStub titulo="Conservação e Restauro" />,
});
