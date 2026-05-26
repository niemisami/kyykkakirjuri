import { confirmHalftime } from '@/lib/gameStore'
import type { Team } from '@/lib/gameStore'
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
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useForm } from '@tanstack/react-form'
import { GripVertical, X } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const HalftimeFormSchema = z.object({
  teamA: z.object({
    players: z
      .array(z.object({ name: z.string().min(1, 'Pelaajan nimi ei voi olla tyhjä') }))
      .min(1, 'Joukkueessa pitää olla vähintään 1 pelaaja')
      .max(4, 'Joukkueessa voi olla enintään 4 pelaajaa'),
  }),
  teamB: z.object({
    players: z
      .array(z.object({ name: z.string().min(1, 'Pelaajan nimi ei voi olla tyhjä') }))
      .min(1, 'Joukkueessa pitää olla vähintään 1 pelaaja')
      .max(4, 'Joukkueessa voi olla enintään 4 pelaajaa'),
  }),
})

interface SortablePlayerRowProps {
  id: string
  index: number
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors: string[]
  onClear: () => void
}

function PlayerRowContent({
  index,
  value,
  onChange,
  onBlur,
  errors,
  onClear,
  isOverlay,
  dndHandlerListeners,
}: Omit<SortablePlayerRowProps, 'id'> & {
  isOverlay?: boolean
  dndHandlerListeners?: ReturnType<typeof useSortable>['listeners']
}) {
  return (
    <div className={`space-y-1 ${isOverlay ? 'shadow-2xl rounded-xl' : ''}`}>
      <div className='flex gap-2 items-center'>
        <button
          {...dndHandlerListeners}
          type='button'
          aria-label='Järjestä vetämällä'
          className='touch-none p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors'
        >
          <GripVertical size={18} />
        </button>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={`Pelaaja ${index + 1}`}
          className='flex-1 rounded-xl border-2 border-border bg-white/70 px-4 py-3 text-base focus:outline-none focus:border-primary transition-colors'
        />
        {value && (
          <button
            type='button'
            onClick={onClear}
            aria-label='Tyhjennä pelaajan nimi'
            className='w-12 h-12 rounded-full border-2 border-destructive/50 text-destructive bg-white/50 hover:bg-destructive/10 flex items-center justify-center text-xl font-bold transition-colors'
          >
            <X size={16} strokeWidth={4} />
          </button>
        )}
      </div>
      {errors.length > 0 && (
        <p className='text-sm text-destructive'>{errors.join(', ')}</p>
      )}
    </div>
  )
}

function SortablePlayerRow({
  id,
  index,
  value,
  onChange,
  onBlur,
  errors,
  onClear,
}: SortablePlayerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={isDragging ? 'invisible' : undefined}
    >
      <PlayerRowContent
        index={index}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        errors={errors}
        onClear={onClear}
        dndHandlerListeners={listeners}
      />
    </div>
  )
}

interface TeamOrderFormProps {
  teams: [Team, Team]
}

export function TeamOrderForm({ teams }: TeamOrderFormProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const form = useForm({
    defaultValues: {
      teamA: { players: teams[0].players.map(name => ({ name })) },
      teamB: { players: teams[1].players.map(name => ({ name })) },
    },
    validators: { onSubmit: HalftimeFormSchema },
    onSubmit: ({ value }) => {
      confirmHalftime(
        value.teamA.players.map(p => p.name),
        value.teamB.players.map(p => p.name)
      )
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className='space-y-6'
    >
      {(['teamA', 'teamB'] as const).map((teamKey, idx) => (
        <form.Field key={teamKey} name={`${teamKey}.players`} mode='array'>
          {(playersField) => {
            const itemIds = playersField.state.value.map((item, i) => `${teamKey}-${item.name}-${i}`)
            const activeIndex = activeId ? itemIds.indexOf(activeId) : -1

            function handleDragStart(event: DragStartEvent) {
              setActiveId(event.active.id as string)
            }

            function handleDragEnd(event: DragEndEvent) {
              const { active, over } = event
              if(!over || active.id === over.id) return
              const oldIndex = itemIds.indexOf(active.id as string)
              const newIndex = itemIds.indexOf(over.id as string)
              if(oldIndex !== -1 && newIndex !== -1) {
                playersField.moveValue(oldIndex, newIndex)
              }
              setActiveId(null)
            }

            return (
              // DndContext wraps the glass-panel so DragOverlay is its sibling,
              // not a child — backdrop-filter on glass-panel would otherwise create
              // a new containing block that breaks position:fixed overlay placement.
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <section className='glass-panel rounded-[2rem] p-8 space-y-5 shadow-md'>
                  {/* TODO replace char – with ─ */}
                  <h2 className='text-headline-md'>{teams[idx].name} - pelaajat erässä 2</h2>

                  <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                    <div className='space-y-3'>
                      {playersField.state.value.map((_, i) => (
                        <form.Field key={itemIds[i]} name={`${teamKey}.players[${i}].name`}>
                          {subField => (
                            <SortablePlayerRow
                              id={itemIds[i]}
                              index={i}
                              value={subField.state.value}
                              onChange={subField.handleChange}
                              onBlur={subField.handleBlur}
                              errors={subField.state.meta.errors.map(String)}
                              onClear={() => subField.handleChange('')}
                            />
                          )}
                        </form.Field>
                      ))}
                    </div>
                  </SortableContext>

                  {playersField.state.meta.errors.length > 0 && (
                    <p className='text-sm text-destructive'>
                      {playersField.state.meta.errors.join(', ')}
                    </p>
                  )}
                  {playersField.state.value.length < 4 && (
                    <button
                      type='button'
                      onClick={() => playersField.pushValue({ name: '' })}
                      className='text-sm font-semibold text-primary hover:text-primary/80 transition-colors'
                    >
                      + Lisää pelaaja
                    </button>
                  )}
                </section>

                <DragOverlay>
                  {activeId && activeIndex !== -1
                    ? (
                      <div className='bg-white rounded-full'>
                        <PlayerRowContent
                          index={activeIndex}
                          value={playersField.state.value[activeIndex]?.name ?? ''}
                          onChange={() => {}}
                          onBlur={() => {}}
                          errors={[]}
                          onClear={() => {}}
                          isOverlay
                        />
                      </div>
                    )
                    : null}

                </DragOverlay>
              </DndContext>
            )
          }}
        </form.Field>
      ))}

      <button
        type='submit'
        className='w-full h-12 bg-primary-container text-primary-container-foreground rounded-xl font-bold text-body-lg active:scale-95 transition-all shadow-lg'
      >
        Aloita erä 2
      </button>
    </form>
  )
}
