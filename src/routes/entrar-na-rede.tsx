import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * A porta de entrada da Rede é uma só: /rede-alem-da-moldura. Esta rota fica
 * apenas como redirecionamento, para não quebrar links já compartilhados.
 */
export const Route = createFileRoute("/entrar-na-rede")({
  beforeLoad: () => {
    throw redirect({ to: "/rede-alem-da-moldura", replace: true });
  },
});
