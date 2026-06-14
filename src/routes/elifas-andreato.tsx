import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/elifas-andreato")({
  component: () => <Outlet />,
});
