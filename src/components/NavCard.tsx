import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import Description from './typography/Description'
import Title from './typography/Title'
import { Item, ItemContent } from './ui/item'

type Props = Omit<LinkProps, 'children'> & (
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

function NavCard({
  to,
  params,
  children,
  title,
  description,
  ...linkProps
}: Props) {
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
