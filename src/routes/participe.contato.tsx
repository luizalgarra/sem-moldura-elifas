import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/participe/contato")({
  head: () => ({ meta: [{ title: "Contato — Participe" }] }),
  component: () => <PaginaStub titulo="Contato" />,
});
