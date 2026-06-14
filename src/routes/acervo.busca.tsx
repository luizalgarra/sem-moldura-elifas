import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/busca")({
  head: () => ({ meta: [{ title: "Busca — Acervo" }] }),
  component: () => <PaginaStub titulo="Busca" />,
});
