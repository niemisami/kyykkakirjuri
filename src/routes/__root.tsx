import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="bg-mesh min-h-screen pb-32">
      <Outlet />
    </div>
  ),
})
