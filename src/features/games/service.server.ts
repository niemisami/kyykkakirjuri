import { db } from '@/server/db'
import { game, gameKyykkaScore, gameTeam, gameTeamPlayer } from '@/server/db/schema'
import { getPlayerPair } from '@/lib/playerPairing'
import type { RoundData, TeamPlayer } from '@/lib/gameStore'
import { eq } from 'drizzle-orm'

export type CreatedGame = Exclude<Awaited<ReturnType<typeof createGameRecord>>, null>

export const createGameRecord = async ({ createdBy }: { createdBy: string }) => {
  const [created] = await db
    .insert(game)
    .values({ sport: 'kyykkä', createdBy })
    .returning()
  return created ?? null
}

export type FinalizeGameInput = {
  gameId: number
  teams: [FinalizeTeam, FinalizeTeam]
  rounds: [RoundData | null, RoundData | null]
}

type FinalizeTeam = {
  teamId: number
  name: string
  /** Players for round 2 (after halftime). Also used for round 1 when no substitution occurred. */
  players: TeamPlayer[]
  /** Players for round 1. Falls back to `players` when no halftime substitution occurred. */
  round1Players?: TeamPlayer[]
}

export const finalizeGameRecord = async ({ gameId, teams, rounds }: FinalizeGameInput) => {
  await db.update(game).set({ endedAt: new Date() }).where(eq(game.id, gameId))

  await db.insert(gameTeam).values(
    teams.map(t => ({
      gameId,
      teamId: t.teamId,
      name: t.name,
    }))
  )

  const teamPlayerRows = teams.flatMap((t) => {
    const r1 = t.round1Players ?? t.players
    const r2 = t.players
    const rows = r1
      .filter(p => p.id !== undefined)
      .map(p => ({ gameId, teamId: t.teamId, playerId: p.id!, name: p.name, round: 1 }))

    if(rounds[1]) {
      r2
        .filter(p => p.id !== undefined)
        .forEach(p => rows.push({ gameId, teamId: t.teamId, playerId: p.id!, name: p.name, round: 2 }))
    }
    return rows
  })

  if(teamPlayerRows.length > 0) {
    await db.insert(gameTeamPlayer).values(teamPlayerRows)
  }

  const scoreRows = rounds.flatMap((round, roundIdx) => {
    if(!round) return []
    const roundNumber = roundIdx + 1

    return (['teamATurns', 'teamBTurns'] as const).flatMap((turnsKey, teamIdx) => {
      const team = teams[teamIdx]
      const roundPlayers = roundIdx === 0 ? (team.round1Players ?? team.players) : team.players
      const turns = round[turnsKey]

      return turns.flatMap((turn, teamTurnIdx) => {
        const [player0, player1] = getPlayerPair(roundPlayers, teamTurnIdx)
        return turn.throws.flatMap((throwRecord, i) => {
          const playerThrowIdx = Math.floor(i / 2) // 0 or 1 (which player in the pair)
          const throwIndex = i % 2 // 0 or 1 (first or second karttu)
          const player = playerThrowIdx === 0 ? player0 : player1
          if(!player?.id) return []
          return [{
            gameId,
            teamId: team.teamId,
            playerId: player.id,
            round: roundNumber,
            turn: teamTurnIdx + 1,
            throwIndex,
            knockedOut: throwRecord.knockedOut,
            pappiCount: throwRecord.pappiCount,
          }]
        })
      })
    })
  })

  if(scoreRows.length > 0) {
    await db.insert(gameKyykkaScore).values(scoreRows)
  }
}
