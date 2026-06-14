import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/como-citar")({
  head: () => ({ meta: [{ title: "Como Citar — Acervo" }] }),
  component: () => <PaginaStub titulo="Como Citar" />,
});
