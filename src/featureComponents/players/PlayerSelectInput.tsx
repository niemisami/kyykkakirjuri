import { FormSelectInput } from '@/components/form/FormSelectInput'
import { playersQueryOptions } from '@/features/players/queries'
import type { Player } from '@/features/players/schemas'
import { useQuery } from '@tanstack/react-query'

type Props = {
  /** Filter players to this team's roster. */
  teamId?: number
  value: Player['id'] | null
  onChange: (value: Player['id'] | null) => void
  /** Player IDs to exclude from the dropdown (e.g. already added). */
  excludeIds?: Player['id'][]
  label?: string
  required?: boolean
  error?: string | string[]
  disabled?: boolean
  className?: string
}

export function PlayerSelectInput({ teamId, value, onChange, excludeIds, label = 'Pelaaja', ...rest }: Props) {
  const { data: allPlayers = [], isLoading } = useQuery(playersQueryOptions(teamId))
  const players = excludeIds?.length ? allPlayers.filter(p => !excludeIds.includes(p.id)) : allPlayers

  return (
    <FormSelectInput
      {...rest}
      label={label}
      placeholder='Valitse pelaaja'
      items={players}
      value={value}
      getLabel={p => p.name}
      getKey={p => p?.id ?? null}
      loading={isLoading}
      onChange={onChange}
    />
  )
}
