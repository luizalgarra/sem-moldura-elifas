import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/quadros-e-ilustracoes")({
  head: () => ({ meta: [{ title: "Quadros e Ilustrações — Acervo" }] }),
  component: () => <PaginaStub titulo="Quadros e Ilustrações" />,
});
