import PlayerCard from '@/features/player/PlayerCard'
import { playersQueryOptions } from '@/features/player/queries'
import type { Player } from '@/features/player/queries'
import { teamsQueryOptions } from '@/features/teams/queries'
import type { Team } from '@/features/teams/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/players/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(playersQueryOptions),
  component: PlayersPage,
  wrapInSuspense: true,
})

function PlayerList({ players, teamsById }: { players: Player[], teamsById: Record<number, Team> }) {
  return (
    <ul className='space-y-2'>
      {players.map((player) => {
        const team = player.teamId ? teamsById[player.teamId] : null
        return (
          <li key={player.id}>
            <PlayerCard player={player} team={team} />
          </li>
        )
      })}
    </ul>
  )
}

function PlayersPage() {
  const { data: players } = useSuspenseQuery(playersQueryOptions)

  const teamIds = players.map(p => p.teamId).filter((id): id is number => id !== null)
  const { data: teams } = useSuspenseQuery(teamsQueryOptions(teamIds))
  const teamsById = teams ? Object.fromEntries(teams.map(t => [t.id, t])) : {}

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Pelaajat</h1>
      {players.length === 0
        ? (
          <p className='text-muted-foreground text-sm'>Ei pelaajia vielä.</p>
        )
        : (
          <PlayerList players={players} teamsById={teamsById} />
        )}
    </div>
  )
}
