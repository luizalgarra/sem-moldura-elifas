import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/instituto/transparencia")({
  head: () => ({ meta: [{ title: "Transparência — O Instituto" }] }),
  component: () => <PaginaStub titulo="Transparência" />,
});
