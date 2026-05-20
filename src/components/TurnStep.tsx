import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Scoreboard } from './Scoreboard'
import {
  recordTurn,
  editTurn,
  overrideRoundScore,
  dismissFieldClearedBanner,
  getActiveTeamIndex,
  getTeamTurnIndex,
  getRoundScore,
  type GameState,
  type TurnRecord,
} from '@/lib/gameStore'
import { getPlayerPair } from '@/lib/playerPairing'
import { TurnInputSchema, RoundOverrideSchema } from '@/lib/schemas'

function fieldErrors(field: AnyFieldApi): string {
  return field.state.meta.errors
    .filter(Boolean)
    .map((e) => (typeof e === 'string' ? e : (e as { message?: string })?.message ?? String(e)))
    .join(', ')
}

interface TurnStepProps {
  state: GameState
}

export function TurnStep({ state }: TurnStepProps) {
  const { teams, rounds, roundIndex, turnIndex, fieldClearedBanner } = state
  const [editingEntry, setEditingEntry] = useState<{
    teamIndex: 0 | 1
    teamTurnIndex: number
  } | null>(null)
  const [overrideTeam, setOverrideTeam] = useState<0 | 1 | null>(null)

  const activeTeamIndex = getActiveTeamIndex(turnIndex)
  const teamTurnIndex = getTeamTurnIndex(turnIndex)
  const activeTeam = teams[activeTeamIndex]
  const playerPair = getPlayerPair(activeTeam.players, teamTurnIndex)
  const round = rounds[roundIndex]

  const teamATurns = round?.teamATurns ?? []
  const teamBTurns = round?.teamBTurns ?? []

  const turnsRemaining = [
    4 - teamATurns.length,
    4 - teamBTurns.length,
  ]

  return (
    <div className="mx-auto max-w-lg px-4 py-4 space-y-4">
      <Scoreboard
        teamAName={teams[0].name}
        teamBName={teams[1].name}
        round1={rounds[0]}
        round2={rounds[1]}
        roundIndex={roundIndex}
      />

      <div className="text-center text-sm text-muted-foreground">
        Erä {roundIndex + 1} · {teams[0].name}: {turnsRemaining[0]} vuoroa jäljellä ·{' '}
        {teams[1].name}: {turnsRemaining[1]} vuoroa jäljellä
      </div>

      {/* Field-cleared banner */}
      {fieldClearedBanner && (
        <div className="rounded-xl bg-green-100 border border-green-400 p-4 text-center space-y-2">
          <p className="font-bold text-green-800 text-lg">
            🎉 Kenttä tyhjä! {fieldClearedBanner.teamName} saa +{fieldClearedBanner.bonus} pistettä
          </p>
          <Button variant="outline" size="sm" onClick={dismissFieldClearedBanner}>
            Sulje
          </Button>
        </div>
      )}

      {/* Override form */}
      {overrideTeam !== null && (
        <OverrideForm
          key={overrideTeam}
          teamName={teams[overrideTeam].name}
          teamIndex={overrideTeam}
          currentScore={getRoundScore(round ?? null, overrideTeam)}
          onSave={() => setOverrideTeam(null)}
          onCancel={() => setOverrideTeam(null)}
        />
      )}

      {/* Edit form */}
      {editingEntry !== null && (
        <EditForm
          key={`${editingEntry.teamIndex}-${editingEntry.teamTurnIndex}`}
          teamName={teams[editingEntry.teamIndex].name}
          roundIdx={roundIndex}
          teamIndex={editingEntry.teamIndex}
          teamTurnIndex={editingEntry.teamTurnIndex}
          existing={
            (editingEntry.teamIndex === 0 ? teamATurns : teamBTurns)[editingEntry.teamTurnIndex]
          }
          onSave={() => setEditingEntry(null)}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      {/* Recording form */}
      {overrideTeam === null && editingEntry === null && (
        <RecordForm
          activeTeamName={activeTeam.name}
          playerPair={playerPair}
          teamTurnIndex={teamTurnIndex}
        />
      )}

      {/* History panel */}
      {overrideTeam === null && editingEntry === null && (
        <HistoryPanel
          teams={teams}
          teamATurns={teamATurns}
          teamBTurns={teamBTurns}
          round={round ?? null}
          onEdit={(teamIndex, teamTurnIdx) =>
            setEditingEntry({ teamIndex, teamTurnIndex: teamTurnIdx })
          }
          onOverride={(teamIndex) => setOverrideTeam(teamIndex)}
        />
      )}
    </div>
  )
}

// ── Recording form ────────────────────────────────────────────────────────────

function RecordForm({
  activeTeamName,
  playerPair,
  teamTurnIndex,
}: {
  activeTeamName: string
  playerPair: [string, string]
  teamTurnIndex: number
}) {
  const form = useForm({
    defaultValues: { akat: 0, papit: 0 },
    validators: { onSubmit: TurnInputSchema },
    onSubmit: ({ value }) => {
      recordTurn(value.akat, value.papit)
      form.reset()
    },
  })

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="text-center space-y-1">
        <p className="text-lg font-bold">{activeTeamName}</p>
        <p className="text-sm text-muted-foreground">
          Vuoro {teamTurnIndex + 1}/4 · {playerPair[0]} &amp; {playerPair[1]}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="akat">
            {(field) => (
              <NumberStepper
                label="Akat"
                value={field.state.value}
                onChange={field.handleChange}
                field={field}
              />
            )}
          </form.Field>

          <form.Field name="papit">
            {(field) => (
              <NumberStepper
                label="Papit"
                value={field.state.value}
                onChange={field.handleChange}
                field={field}
              />
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(s) => [s.values.akat, s.values.papit] as const}>
          {([akat, papit]) => (
            <p className="text-center text-sm text-muted-foreground">
              Tyhjennetty: {Math.max(0, akat + papit)} kyykkää
            </p>
          )}
        </form.Subscribe>

        <Button type="submit" size="lg" className="w-full">
          Vahvista
        </Button>
      </form>
    </div>
  )
}

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditForm({
  teamName,
  roundIdx,
  teamIndex,
  teamTurnIndex,
  existing,
  onSave,
  onCancel,
}: {
  teamName: string
  roundIdx: 0 | 1
  teamIndex: 0 | 1
  teamTurnIndex: number
  existing?: TurnRecord
  onSave: () => void
  onCancel: () => void
}) {
  const form = useForm({
    defaultValues: {
      akat: existing?.akat ?? 0,
      papit: existing?.papit ?? 0,
    },
    validators: { onSubmit: TurnInputSchema },
    onSubmit: ({ value }) => {
      editTurn(roundIdx, teamIndex, teamTurnIndex, value.akat, value.papit)
      onSave()
    },
  })

  return (
    <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          Muokkaa: {teamName} – vuoro {teamTurnIndex + 1}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Peruuta
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="akat">
            {(field) => (
              <NumberStepper
                label="Akat"
                value={field.state.value}
                onChange={field.handleChange}
                field={field}
              />
            )}
          </form.Field>

          <form.Field name="papit">
            {(field) => (
              <NumberStepper
                label="Papit"
                value={field.state.value}
                onChange={field.handleChange}
                field={field}
              />
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(s) => s.errors}>
          {(errors) => {
            const msg = errors
              .filter(Boolean)
              .map((e) =>
                typeof e === 'string' ? e : (e as { message?: string })?.message ?? String(e),
              )
              .filter(Boolean)
              .join(', ')
            return msg ? (
              <p className="text-sm text-destructive text-center">{msg}</p>
            ) : null
          }}
        </form.Subscribe>

        <Button type="submit" size="lg" className="w-full">
          Tallenna muutos
        </Button>
      </form>
    </div>
  )
}

// ── Override form ─────────────────────────────────────────────────────────────

function OverrideForm({
  teamName,
  teamIndex,
  currentScore,
  onSave,
  onCancel,
}: {
  teamName: string
  teamIndex: 0 | 1
  currentScore: number
  onSave: () => void
  onCancel: () => void
}) {
  const form = useForm({
    defaultValues: { points: currentScore },
    validators: { onSubmit: RoundOverrideSchema },
    onSubmit: ({ value }) => {
      overrideRoundScore(teamIndex, value.points)
      onSave()
    },
  })

  return (
    <div className="rounded-xl border border-yellow-400 bg-yellow-50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Korjaa erätulos: {teamName}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Peruuta
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.Field name="points">
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium mb-1">
                Erätulos (pistettä)
              </label>
              <input
                id={field.name}
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                onBlur={field.handleBlur}
                className="w-full rounded-lg border px-3 py-3 text-base text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <Button type="submit" size="lg" className="w-full">
          Aseta tulos
        </Button>
      </form>
    </div>
  )
}

// ── History panel ─────────────────────────────────────────────────────────────

function HistoryPanel({
  teams,
  teamATurns,
  teamBTurns,
  round,
  onEdit,
  onOverride,
}: {
  teams: GameState['teams']
  teamATurns: TurnRecord[]
  teamBTurns: TurnRecord[]
  round: import('@/lib/gameStore').RoundData | null
  onEdit: (teamIndex: 0 | 1, teamTurnIndex: number) => void
  onOverride: (teamIndex: 0 | 1) => void
}) {
  const totalTurns = teamATurns.length + teamBTurns.length
  if (totalTurns === 0) return null

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Kirjatut vuorot</h3>

      {([0, 1] as const).map((teamIdx) => {
        const turns = teamIdx === 0 ? teamATurns : teamBTurns
        const hasOverride =
          teamIdx === 0 ? round?.teamAOverride !== undefined : round?.teamBOverride !== undefined
        if (turns.length === 0) return null

        return (
          <div key={teamIdx} className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">{teams[teamIdx].name}</p>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onOverride(teamIdx)}
              >
                {hasOverride ? '✏️ Korjattu' : 'Korjaa erätulos'}
              </Button>
            </div>
            {turns.map((turn, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2"
              >
                <span className="text-muted-foreground">Vuoro {i + 1}</span>
                <span>
                  {turn.result.fieldCleared ? (
                    <span className="text-green-700 font-medium">
                      Kenttä tyhjä! +{turn.result.unusedKartut}
                    </span>
                  ) : (
                    `A: ${turn.akat} · P: ${turn.papit} (${turn.result.points}p)`
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onEdit(teamIdx, i)}
                >
                  Muokkaa
                </Button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── Number stepper ────────────────────────────────────────────────────────────

function NumberStepper({
  label,
  value,
  onChange,
  field,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  field: AnyFieldApi
}) {
  const errorMsg = fieldErrors(field)
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-center">{label}</label>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`Vähennä ${label}`}
        >
          −
        </Button>
        <input
          type="number"
          value={value}
          min={0}
          max={40}
          onChange={(e) => onChange(Math.max(0, Math.min(40, e.target.valueAsNumber || 0)))}
          className="flex-1 rounded-lg border px-2 py-3 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => onChange(Math.min(40, value + 1))}
          aria-label={`Lisää ${label}`}
        >
          +
        </Button>
      </div>
      {errorMsg && (
        <p className="text-xs text-destructive text-center">{errorMsg}</p>
      )}
    </div>
  )
}
