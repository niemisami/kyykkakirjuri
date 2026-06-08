import { CheckCircle, Clock } from 'lucide-react'

import Description from '@/components/typography/Description'
import Title from '@/components/typography/Title'
import { ItemContent, ItemMedia } from '@/components/ui/item'
import type { Game } from '@/features/games/schemas'

type Props = {
  game: Game
}

const GameItem = ({ game }: Props) => {
  const isFinished = game.endedAt !== null
  const date = new Date(game.startedAt).toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <ItemMedia>
        {isFinished
          ? <CheckCircle className='size-10 rounded-xl bg-muted p-2.5 text-green-600' />
          : <Clock className='size-10 rounded-xl bg-muted p-2.5 text-yellow-500' />}
      </ItemMedia>
      <ItemContent>
        <Title>Peli {date}</Title>
        <Description>
          {isFinished ? 'Päättynyt' : 'Käynnissä'}
        </Description>
      </ItemContent>
    </>
  )
}

export default GameItem
