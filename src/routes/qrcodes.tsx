import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/qrcodes")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});
