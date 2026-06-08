import NavCard from '@/components/NavCard'
import type { Game } from '@/features/games/schemas'
import GameItem from './details/Item'

type Props = {
  game: Game
}

const GameCard = ({ game }: Props) => {
  return (
    <NavCard
      to='/games/$gameId'
      params={{ gameId: game.id }}
      viewTransition
    >
      <GameItem game={game} />
    </NavCard>
  )
}

export default GameCard
