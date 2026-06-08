import { HalftimeStep } from '@/components/HalftimeStep'
import { ResultsStep } from '@/components/ResultsStep'
import { SetupStep } from '@/components/SetupStep'
import { TurnStep } from '@/components/TurnStep'
import { useGameStore } from '@/lib/useGameStore'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/games/new')({
  component: RouteComponent,
  ssr: false,
})

function RouteComponent() {
  const state = useGameStore()
  switch(state.phase) {
    case 'setup':
      return <SetupStep />
    case 'round':
      return <TurnStep state={state} />
    case 'halftime':
      return <HalftimeStep state={state} />
    case 'finished':
      return <ResultsStep state={state} />
  }
}
