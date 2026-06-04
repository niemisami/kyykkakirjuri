import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type Props = {
  title: ReactNode
  description?: ReactNode
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
      {description
        ? typeof description === 'string'
          ? <NavCard.DescriptionTitle>{description}</NavCard.DescriptionTitle>
          : description
        : null}
    </Link>
  )
}

function NavCardDescriptionTitle({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <p className={cn('text-muted-foreground text-sm', className)}>{children}</p>
  )
}

NavCard.DescriptionTitle = NavCardDescriptionTitle

export default NavCard
