import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlayerItemContent } from './PlayerItemContent'

type SortablePlayerItemProps = {
  id: string
  name: string
  onRemove: () => void
}

export function SortablePlayerItem({ id, name, onRemove }: SortablePlayerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={isDragging ? 'invisible' : undefined}
    >
      <PlayerItemContent name={name} onRemove={onRemove} listeners={listeners} />
    </div>
  )
}
