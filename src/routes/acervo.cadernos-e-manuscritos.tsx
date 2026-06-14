import { createFileRoute } from "@tanstack/react-router";
import { PaginaStub } from "@/components/PaginaStub";

export const Route = createFileRoute("/acervo/cadernos-e-manuscritos")({
  head: () => ({ meta: [{ title: "Cadernos e Manuscritos — Acervo" }] }),
  component: () => <PaginaStub titulo="Cadernos e Manuscritos" />,
});
