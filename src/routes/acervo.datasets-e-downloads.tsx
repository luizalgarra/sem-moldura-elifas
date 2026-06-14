import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/datasets-e-downloads")({
  head: () => ({ meta: [{ title: "Datasets e Downloads — Acervo" }] }),
  component: () => <PaginaStub titulo="Datasets e Downloads" />,
});
