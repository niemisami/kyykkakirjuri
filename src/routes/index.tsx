import { createFileRoute } from '@tanstack/react-router'
import { useGameStore } from '@/lib/useGameStore'
import { SetupStep } from '@/components/SetupStep'
import { TurnStep } from '@/components/TurnStep'
import { HalftimeStep } from '@/components/HalftimeStep'
import { ResultsStep } from '@/components/ResultsStep'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
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
