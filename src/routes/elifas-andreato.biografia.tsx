import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/elifas-andreato/biografia")({
  head: () => ({ meta: [{ title: "Biografia — Elifas Andreato" }] }),
  component: () => <PaginaStub titulo="Biografia" />,
});
