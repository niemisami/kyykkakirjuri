import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
