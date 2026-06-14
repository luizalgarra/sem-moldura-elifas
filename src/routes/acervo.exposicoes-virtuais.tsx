import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/exposicoes-virtuais")({
  head: () => ({ meta: [{ title: "Exposições Virtuais — Acervo" }] }),
  component: () => <PaginaStub titulo="Exposições Virtuais" />,
});
