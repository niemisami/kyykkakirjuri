import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'

type Props = {
  title: string
  description?: string
} & LinkProps

function NavCard({
  to,
  params,
  title,
  description,
}: Props) {
  return (
    <Link
      to={to}
      params={params ?? undefined}
      className='block rounded-lg border px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900'
    >
      <p className='font-medium'>{title}</p>
      {description && <p className='text-muted-foreground text-sm'>{description}</p>}
    </Link>
  )
}

export default NavCard
