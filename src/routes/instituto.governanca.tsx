import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/instituto/governanca")({
  head: () => ({ meta: [{ title: "Governança — O Instituto" }] }),
  component: () => <PaginaStub titulo="Governança" />,
});
