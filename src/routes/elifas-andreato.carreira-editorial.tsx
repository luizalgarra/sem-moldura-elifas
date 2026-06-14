import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/elifas-andreato/carreira-editorial")({
  head: () => ({ meta: [{ title: "Carreira Editorial — Elifas Andreato" }] }),
  component: () => <PaginaStub titulo="Carreira Editorial" />,
});
