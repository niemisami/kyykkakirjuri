import { useQuery } from '@tanstack/react-query'
import { FormSelectInput } from '@/components/form/FormSelectInput'
import { teamsQueryOptions } from '@/features/teams/queries'
import type { Team } from '@/features/teams/schemas'

type BaseProps = {
  label?: string
  required?: boolean
  error?: string | string[]
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  className?: string
}

type SingleProps = BaseProps & {
  multiple?: false
  value: Team['id'] | null
  onChange: (value: Team['id'] | null) => void
}

export type TeamSelectInputProps = SingleProps

export function TeamSelectInput(props: TeamSelectInputProps) {
  const { data: teams = [], isLoading } = useQuery(teamsQueryOptions())

  const defaultLabel = props.multiple ? 'Joukkueet' : 'Joukkue'
  const { label = defaultLabel, ...rest } = props

  return (
    <FormSelectInput
      {...rest}
      items={teams}
      getLabel={t => t.name}
      getKey={t => t?.id}
      label={label}
      loading={isLoading}
    />
  )
}
