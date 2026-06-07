import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { startGame } from '@/lib/gameStore'
import { createTrackedGame } from '@/features/games/mutations'
import { teamsQueryOptions } from '@/features/teams/queries'
import type { PlayerEntry } from './PlayerItemContent'
import { TrackedTeamSection } from './TrackedTeamSection'

export function TrackedGameForm() {
  const [teamAId, setTeamAId] = useState<number | null>(null)
  const [teamBId, setTeamBId] = useState<number | null>(null)
  const [teamAPlayers, setTeamAPlayers] = useState<PlayerEntry[]>([])
  const [teamBPlayers, setTeamBPlayers] = useState<PlayerEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  const { data: teams = [] } = useQuery(teamsQueryOptions())

  const createMutation = useMutation({
    mutationFn: () => createTrackedGame(),
    onSuccess: (created) => {
      const teamA = teams.find(t => t.id === teamAId)
      const teamB = teams.find(t => t.id === teamBId)
      if(!teamA || !teamB) return
      startGame(
        teamA.name, teamAPlayers,
        teamB.name, teamBPlayers,
        { mode: 'tracked', gameId: created.id, teamAId: teamA.id, teamBId: teamB.id }
      )
    },
    onError: () => setError('Pelin aloittaminen epäonnistui. Yritä uudelleen.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if(!teamAId || !teamBId) {
      setError('Valitse molemmat joukkueet')
      return
    }
    if(teamAId === teamBId) {
      setError('Joukkueet eivät voi olla samat')
      return
    }
    if(teamAPlayers.length === 0) {
      setError('Valitse pelaajat joukkueelle A')
      return
    }
    if(teamBPlayers.length === 0) {
      setError('Valitse pelaajat joukkueelle B')
      return
    }
    createMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <TrackedTeamSection
        teamKey='A'
        teamId={teamAId}
        players={teamAPlayers}
        onTeamIdChange={setTeamAId}
        onPlayersChange={setTeamAPlayers}
      />
      <TrackedTeamSection
        teamKey='B'
        teamId={teamBId}
        players={teamBPlayers}
        onTeamIdChange={setTeamBId}
        onPlayersChange={setTeamBPlayers}
      />

      {error && <p className='text-sm text-destructive text-center'>{error}</p>}

      <button
        type='submit'
        disabled={createMutation.isPending}
        className='w-full h-12 bg-primary-container text-primary-container-foreground rounded-xl font-bold text-body-lg active:scale-95 transition-all shadow-lg disabled:opacity-60'
      >
        {createMutation.isPending ? 'Aloitetaan…' : 'Aloita peli'}
      </button>
    </form>
  )
}
