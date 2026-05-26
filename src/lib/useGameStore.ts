import { useSyncExternalStore } from 'react'
import { gameStore } from './gameStore'
import type { GameState } from './gameStore'

export function useGameStore(): GameState {
  return useSyncExternalStore(
    (notify) => {
      const sub = gameStore.subscribe(() => notify())
      return () => sub.unsubscribe()
    },
    () => gameStore.state
  )
}
