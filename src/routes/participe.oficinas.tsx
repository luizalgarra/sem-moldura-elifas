import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/participe/oficinas")({
  head: () => ({ meta: [{ title: "Oficinas — Participe" }] }),
  component: () => <PaginaStub titulo="Oficinas" />,
});
