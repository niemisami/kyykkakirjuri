import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { ensureSession } from '@/lib/auth/authFunctions'
import type { Player } from './schemas'
import { playerQuery, playersQuery } from './service.server'

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
  .inputValidator(z.object({ teamId: z.number().optional() }))
  .handler(async ({ data }): Promise<Player[]> => {
    const result = await playersQuery({ teamId: data.teamId })
    return result
  })

export const myPlayerQueryOptions = queryOptions({
  queryKey: ['player', 'me'],
  queryFn: () => fetchMyPlayer(),
})

export const playersQueryOptions = (teamId?: number) =>
  queryOptions({
    queryKey: ['players', teamId],
    queryFn: () => fetchPlayers({ data: { teamId } }),
  })

export const playerQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['player', id],
    queryFn: () => fetchPlayer({ data: id }),
  })
