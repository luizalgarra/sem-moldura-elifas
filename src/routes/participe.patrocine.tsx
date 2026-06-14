import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/participe/patrocine")({
  head: () => ({ meta: [{ title: "Patrocine — Participe" }] }),
  component: () => <PaginaStub titulo="Patrocine" />,
});
