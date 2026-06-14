import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/elifas-andreato/arte-e-resistencia")({
  head: () => ({ meta: [{ title: "Arte e Resistência — Elifas Andreato" }] }),
  component: () => <PaginaStub titulo="Arte e Resistência" />,
});
