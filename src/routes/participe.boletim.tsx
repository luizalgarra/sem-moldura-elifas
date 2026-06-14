import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/participe/boletim")({
  head: () => ({ meta: [{ title: "Boletim — Participe" }] }),
  component: () => <PaginaStub titulo="Boletim" />,
});
