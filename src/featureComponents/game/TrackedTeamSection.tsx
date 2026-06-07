import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TeamSelectInput } from '@/featureComponents/teams/TeamSelectInput'
import { PlayerSelectInput } from '@/featureComponents/players/PlayerSelectInput'
import { playersQueryOptions } from '@/features/players/queries'
import type { PlayerEntry } from './PlayerItemContent'
import { PlayerItemContent } from './PlayerItemContent'
import { SortablePlayerItem } from './SortablePlayerItem'

type TrackedTeamSectionProps = {
  teamKey: 'A' | 'B'
  teamId: number | null
  players: PlayerEntry[]
  onTeamIdChange: (id: number | null) => void
  onPlayersChange: (players: PlayerEntry[] | ((prev: PlayerEntry[]) => PlayerEntry[])) => void
}

export function TrackedTeamSection({
  teamKey,
  teamId,
  players,
  onTeamIdChange,
  onPlayersChange,
}: TrackedTeamSectionProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const { data: allPlayers = [] } = useQuery(playersQueryOptions(teamId ?? undefined))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const itemIds = players.map((p, i) => `${teamKey}-${p.id}-${i}`)
  const activeIndex = activeId ? itemIds.indexOf(activeId) : -1

  useEffect(() => {
    if(!selectedId || players.length >= 4) return
    const player = allPlayers.find(p => p.id === selectedId)
    if(!player) return
    onPlayersChange(prev => [...prev, { id: player.id, name: player.name }])
    setSelectedId(null)
  }, [selectedId])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if(over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id.toString())
      const newIndex = itemIds.indexOf(over.id.toString())
      if(oldIndex !== -1 && newIndex !== -1) {
        onPlayersChange((prev) => {
          const next = [...prev]
          const [moved] = next.splice(oldIndex, 1)
          next.splice(newIndex, 0, moved)
          return next
        })
      }
    }
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={e => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <section className='glass-panel rounded-[2rem] p-8 space-y-5 shadow-md'>
        <h2 className='text-headline-md'>Joukkue {teamKey}</h2>
        <TeamSelectInput
          label='Joukkue'
          value={teamId}
          onChange={(id) => {
            onTeamIdChange(id)
            onPlayersChange([])
            setSelectedId(null)
          }}
        />
        {teamId && (
          <div className='space-y-3'>
            <div className='flex gap-2 items-end'>
              <PlayerSelectInput
                teamId={teamId}
                value={selectedId}
                onChange={setSelectedId}
                label={`Pelaajat (${players.length}/4)`}
                disabled={allPlayers.length === 0 || players.length >= 4}
              />
            </div>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              <div className='space-y-2'>
                {players.map((player, i) => (
                  <SortablePlayerItem
                    key={itemIds[i]}
                    id={itemIds[i]}
                    name={player.name}
                    onRemove={() => onPlayersChange(prev => prev.filter((_, idx) => idx !== i))}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}
      </section>

      <DragOverlay>
        {activeId && activeIndex !== -1
          ? (
            <div className='bg-white rounded-xl shadow-2xl'>
              <PlayerItemContent
                name={players[activeIndex]?.name ?? ''}
                onRemove={() => {}}
                isOverlay
              />
            </div>
          )
          : null}
      </DragOverlay>
    </DndContext>
  )
}
