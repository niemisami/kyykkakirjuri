import type { ComponentProps } from 'react'
import { ItemTitle } from '../ui/item'

type Props = ComponentProps<typeof ItemTitle>

const Title = (props: Props) => {
  return (
    <ItemTitle {...props} />
  )
}

export default Title
