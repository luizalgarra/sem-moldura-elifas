import { Outlet, createFileRoute } from "@tanstack/react-router";

/**
 * Layout da Rede Além da Moldura.
 *
 * A página de apresentação (com o formulário) vive em
 * `rede-alem-da-moldura.index.tsx`; a conversa com o Anfitrião vive em
 * `rede-alem-da-moldura.conversa.tsx`, numa tela limpa. Este arquivo existe
 * só para os dois filhos montarem.
 */
export const Route = createFileRoute("/rede-alem-da-moldura")({
  component: () => <Outlet />,
});
