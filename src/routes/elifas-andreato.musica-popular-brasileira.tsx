import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/elifas-andreato/musica-popular-brasileira")({
  head: () => ({ meta: [{ title: "Música Popular Brasileira — Elifas Andreato" }] }),
  component: () => <PaginaStub titulo="Música Popular Brasileira" />,
});
