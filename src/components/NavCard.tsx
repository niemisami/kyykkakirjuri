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
  ...linkProps
}: Props) {
  return (
    <Link
      to={to}
      params={params ?? undefined}
      className='block rounded-lg border px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900'
      {...linkProps}
    >
      {title
        ? typeof title === 'string'
          ? <NavCard.Title>{title}</NavCard.Title>
          : title
        : null}
      {description
        ? typeof description === 'string'
          ? <NavCard.DescriptionTitle>{description}</NavCard.DescriptionTitle>
          : description
        : null}
    </Link>
  )
}

function NavCardTitle({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <p className={cn('font-medium', className)}>{children}</p>
  )
}
function NavCardDescriptionTitle({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <p className={cn('text-muted-foreground text-sm', className)}>{children}</p>
  )
}

NavCard.Title = NavCardTitle
NavCard.DescriptionTitle = NavCardDescriptionTitle

export default NavCard
