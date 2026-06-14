import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/fotografias-e-cromos")({
  head: () => ({ meta: [{ title: "Fotografias e Cromos — Acervo" }] }),
  component: () => <PaginaStub titulo="Fotografias e Cromos" />,
});
