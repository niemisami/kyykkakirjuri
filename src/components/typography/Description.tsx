import type { ComponentProps } from 'react'
import { ItemDescription } from '../ui/item'

type Props = ComponentProps<typeof ItemDescription>

const Description = (props: Props) => {
  return (
    <ItemDescription {...props} />
  )
}

export default Description
