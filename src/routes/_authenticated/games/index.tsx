import { LinkButton } from '@/components/LinkButton'
import { ItemGroup } from '@/components/ui/item'
import GameCard from '@/featureComponents/games/GameCard'
import { gamesQueryOptions } from '@/features/games/queries'
import type { Game } from '@/features/games/schemas'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/games/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(gamesQueryOptions()),
  component: GamesPage,
  wrapInSuspense: true,
})

function GameList({ games }: { games: Game[] }) {
  return (
    <ItemGroup>
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </ItemGroup>
  )
}

function GamesPage() {
  const { data: games } = useSuspenseQuery(gamesQueryOptions())

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Pelit</h1>
      </div>

      <div>
        <LinkButton
          to='/games/new'
          size='lg'
        >
          Aloita uusi peli
        </LinkButton>
      </div>

      {games.length === 0
        ? <p className='text-muted-foreground text-sm'>Ei pelejä vielä.</p>
        : <GameList games={games} />}
    </div>
  )
}
