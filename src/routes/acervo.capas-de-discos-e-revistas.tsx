import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/capas-de-discos-e-revistas")({
  head: () => ({ meta: [{ title: "Capas de Discos e Revistas — Acervo" }] }),
  component: () => <PaginaStub titulo="Capas de Discos e Revistas" />,
});
