import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <h1 className="text-3xl font-bold tracking-tight">Kyykkakirjuri</h1>
      <p className="mt-2 text-muted-foreground">Pistelaskuri kyykkäpeleille</p>
    </main>
  )
}
