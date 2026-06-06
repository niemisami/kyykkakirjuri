import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { ensureSession } from '@/lib/auth/authFunctions'
import type { Player } from './schemas'
import { playerQuery, playersQuery } from './helpers.server'

export const fetchPlayer = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const result = await playerQuery({ id })
    return result
  })

export const fetchMyPlayer = createServerFn({ method: 'GET' })
  .handler(async (): Promise<Player | null> => {
    const session = await ensureSession()
    const result = await playerQuery({ userId: session.user.id })
    return result
  })

export const fetchPlayers = createServerFn({ method: 'GET' })
  .handler(async (): Promise<Player[]> => {
    const result = await playersQuery({})
    return result
  })

export const myPlayerQueryOptions = queryOptions({
  queryKey: ['player', 'me'],
  queryFn: () => fetchMyPlayer(),
})

export const playersQueryOptions = queryOptions({
  queryKey: ['player'],
  queryFn: () => fetchPlayers(),
})

export const playerQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['player', id],
    queryFn: () => fetchPlayer({ data: id }),
  })
