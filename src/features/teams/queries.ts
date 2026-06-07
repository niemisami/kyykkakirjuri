import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { teamQuery, teamsQuery } from './service.server'
import type { Team } from './service.server'
import { playersQuery } from '../players/service.server'
import type { Player } from '../players/schemas'

export const fetchTeam = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }): Promise<{ team: Team | null, players: Player[] }> => {
    const [foundTeam, players] = await Promise.all([
      teamQuery({ id }),
      playersQuery({ teamId: id }),
    ])
    return { team: foundTeam, players }
  })

export const fetchTeams = createServerFn({ method: 'GET' })
  .inputValidator(z.array(z.number()).optional())
  .handler(async ({ data: ids }) => {
    return teamsQuery({ ids })
  })

export const teamsQueryOptions = (ids?: number[]) => queryOptions({
  queryKey: ['teams', ids],
  queryFn: () => fetchTeams({ data: ids }),
})

export const teamQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['teams', id],
    queryFn: () => fetchTeam({ data: id }),
  })
