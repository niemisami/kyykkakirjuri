import { GripVertical, X } from 'lucide-react'
import type { useSortable } from '@dnd-kit/sortable'

export type PlayerEntry = { id: number, name: string }

type PlayerItemContentProps = {
  name: string
  onRemove: () => void
  isOverlay?: boolean
  listeners?: ReturnType<typeof useSortable>['listeners']
}

export function PlayerItemContent({ name, onRemove, isOverlay, listeners }: PlayerItemContentProps) {
  return (
    <div className={`flex gap-2 items-center ${isOverlay ? 'shadow-2xl rounded-xl' : ''}`}>
      <button
        {...listeners}
        type='button'
        aria-label='Järjestä vetämällä'
        className='touch-none p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors'
      >
        <GripVertical size={18} />
      </button>
      <span className='flex-1 rounded-xl border-2 border-border bg-white/70 px-4 py-3 text-base'>
        {name}
      </span>
      <button
        type='button'
        onClick={onRemove}
        aria-label='Poista pelaaja'
        className='w-12 h-12 rounded-full border-2 border-destructive/50 text-destructive bg-white/50 hover:bg-destructive/10 flex items-center justify-center transition-colors'
      >
        <X size={16} strokeWidth={4} />
      </button>
    </div>
  )
}
