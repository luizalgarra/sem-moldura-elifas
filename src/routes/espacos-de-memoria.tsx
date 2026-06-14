import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/espacos-de-memoria")({
  component: () => <Outlet />,
});
