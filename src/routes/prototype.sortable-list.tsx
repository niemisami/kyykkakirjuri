// PROTOTYPE — throwaway
// Question: "What should a sortable list with a dnd-kit handle look like?"
// Three variants switchable via ?variant= on /prototype/sortable-list

import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,

} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { PrototypeSwitcher } from '@/components/PrototypeSwitcher'

export const Route = createFileRoute('/prototype/sortable-list')({
  validateSearch: (search: Record<string, unknown>) => ({
    variant: (search.variant as string) ?? 'A',
  }),
  component: SortableListPrototype,
})

const INITIAL_ITEMS = [
  { id: '1', label: 'Pelaaja 1', subtitle: 'Joukkue A' },
  { id: '2', label: 'Pelaaja 2', subtitle: 'Joukkue A' },
  { id: '3', label: 'Pelaaja 3', subtitle: 'Joukkue B' },
  { id: '4', label: 'Pelaaja 4', subtitle: 'Joukkue B' },
  { id: '5', label: 'Pelaaja 5', subtitle: 'Joukkue A' },
  { id: '6', label: 'Pelaaja 6', subtitle: 'Joukkue B' },
]

type Item = (typeof INITIAL_ITEMS)[number]

const VARIANTS = [
  { key: 'A', name: 'Card Grip' },
  { key: 'B', name: 'Compact Rows' },
  { key: 'C', name: 'Pill Stack' },
]

function SortableListPrototype() {
  const { variant } = Route.useSearch()
  const navigate = useNavigate({ from: '/prototype/sortable-list' })
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if(over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex(i => i.id === active.id)
        const newIndex = prev.findIndex(i => i.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  function changeVariant(key: string) {
    navigate({ search: { variant: key }, replace: true })
  }

  return (
    <div className='min-h-screen p-6 flex flex-col items-center'>
      <div className='w-full max-w-md'>
        <div className='mb-6'>
          <p className='text-label-caps text-muted-foreground'>PROTOTYPE</p>
          <h1 className='text-headline-md mt-1'>Sortable List</h1>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {variant === 'A' && <VariantA items={items} />}
            {variant === 'B' && <VariantB items={items} />}
            {variant === 'C' && <VariantC items={items} />}
          </SortableContext>
        </DndContext>

        <div className='mt-4 p-3 bg-muted rounded-lg'>
          <p className='text-label-caps text-muted-foreground mb-1'>ORDER</p>
          <p className='text-sm font-mono text-foreground'>
            {items.map(i => i.label).join(' → ')}
          </p>
        </div>
      </div>

      <PrototypeSwitcher variants={VARIANTS} current={variant} onChange={changeVariant} />
    </div>
  )
}

// ─── Variant A: Card Grip ───────────────────────────────────────────────────
// Large cards, handle on left, label + subtitle — classic iOS-style reorder

function VariantA({ items }: { items: Item[] }) {
  return (
    <div className='flex flex-col gap-2'>
      {items.map(item => (
        <CardGripItem key={item.id} item={item} />
      ))}
    </div>
  )
}

function CardGripItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={`flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm select-none transition-shadow ${
        isDragging ? 'opacity-50 shadow-xl ring-2 ring-primary' : ''
      }`}
    >
      <button
        {...listeners}
        className='text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 rounded'
        aria-label='Drag handle'
        tabIndex={-1}
      >
        <GripVertical size={20} />
      </button>
      <div className='flex-1 min-w-0'>
        <p className='font-semibold text-foreground truncate'>{item.label}</p>
        <p className='text-sm text-muted-foreground'>{item.subtitle}</p>
      </div>
    </div>
  )
}

// ─── Variant B: Compact Rows ────────────────────────────────────────────────
// Dense table rows, index number left, handle right — information-dense

function VariantB({ items }: { items: Item[] }) {
  return (
    <div className='divide-y divide-border border border-border rounded-lg overflow-hidden bg-card'>
      {items.map((item, index) => (
        <CompactRowItem key={item.id} item={item} index={index + 1} />
      ))}
    </div>
  )
}

function CompactRowItem({ item, index }: { item: Item, index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={`flex items-center px-3 py-2.5 gap-3 select-none ${
        isDragging ? 'bg-accent opacity-60' : 'bg-card hover:bg-muted'
      }`}
    >
      <span className='text-label-caps text-muted-foreground w-5 text-center shrink-0'>
        {index}
      </span>
      <div className='flex-1 min-w-0'>
        <span className='text-sm font-medium text-foreground'>{item.label}</span>
        <span className='text-xs text-muted-foreground ml-2'>{item.subtitle}</span>
      </div>
      <button
        {...listeners}
        className='text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none p-1 rounded shrink-0'
        aria-label='Drag handle'
        tabIndex={-1}
      >
        <GripVertical size={16} />
      </button>
    </div>
  )
}

// ─── Variant C: Pill Stack ──────────────────────────────────────────────────
// Colorful rounded pills, handle integrated left — playful, badge-style

const PILL_COLORS = [
  'bg-primary text-primary-foreground',
  'bg-primary-container text-primary-container-foreground',
  'bg-secondary text-secondary-foreground',
  'bg-accent text-accent-foreground',
  'bg-muted text-foreground',
  'bg-secondary text-secondary-foreground',
]

function VariantC({ items }: { items: Item[] }) {
  return (
    <div className='flex flex-col gap-2'>
      {items.map((item, index) => (
        <PillItem
          key={item.id}
          item={item}
          colorClass={PILL_COLORS[index % PILL_COLORS.length]}
        />
      ))}
    </div>
  )
}

function PillItem({ item, colorClass }: { item: Item, colorClass: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={`flex items-center gap-2 rounded-full px-3 py-2.5 select-none ${colorClass} ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        {...listeners}
        className='cursor-grab active:cursor-grabbing touch-none opacity-50 hover:opacity-100 p-0.5 rounded-full shrink-0'
        aria-label='Drag handle'
        tabIndex={-1}
      >
        <GripVertical size={16} />
      </button>
      <span className='font-semibold text-sm flex-1'>{item.label}</span>
      <span className='text-xs opacity-60'>{item.subtitle}</span>
    </div>
  )
}
