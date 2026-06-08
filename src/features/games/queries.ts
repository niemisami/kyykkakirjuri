import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { gameQuery, gamesQuery } from './service.server'

// TODO: add session checks to server functions
export const fetchGames = createServerFn({ method: 'GET' })
  .handler(async () => {
    return gamesQuery()
  })

export const fetchGame = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    return gameQuery({ id })
  })

export const gamesQueryOptions = () =>
  queryOptions({
    queryKey: ['games'],
    queryFn: () => fetchGames(),
  })

export const gameQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['games', id],
    queryFn: () => fetchGame({ data: id }),
  })
