import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/participe/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Participe" }] }),
  component: () => <PaginaStub titulo="Agenda" />,
});
