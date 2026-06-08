import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import Description from './typography/Description'
import Title from './typography/Title'
import { Item, ItemContent } from './ui/item'

type Props = Omit<LinkProps, 'children'> &
  {
    className?: string
    isEmphasized?: boolean
  } & (
  {
    title: ReactNode
    description?: ReactNode
    children?: never
  } | {
    children: ReactNode
    title?: never
    description?: never
  }
)

const navCardVariants = cva(
  '',
  {
    variants: {
      isEmphasized: {
        true: 'bg-primary text-primary-foreground [a]:hover:bg-primary-container [a]:dark:hover:bg-primary-900 **:data-[slot=item-description]:text-primary-foreground/80',
        false: null,
      },
    },
    defaultVariants: {
      isEmphasized: false,
    },
  })

function NavCard({
  to,
  params,
  children,
  title,
  description,
  className,
  isEmphasized,
  ...linkProps
}: Props & VariantProps<typeof navCardVariants>) {
  const content = children || (
    <ItemContent>
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
    </ItemContent>
  )

  return (
    <Item
      variant='outline'
      className={navCardVariants({ isEmphasized, className })}
      {...linkProps}
      render={(
        <Link
          params={params ?? undefined}
          to={to}
        />
      )}
    >
      {content}
    </Item>
  )
}

NavCard.Title = Title
NavCard.DescriptionTitle = Description

export default NavCard
