import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Scoreboard } from './Scoreboard'
import {
  recordPlayerThrow,
  editPlayerThrow,
  overrideRoundScore,
  dismissFieldClearedBanner,
  getActiveTeamIndex,
  getTeamTurnIndex,
  getRoundScore,

} from '@/lib/gameStore'
import type { GameState, RoundData, TurnRecord } from '@/lib/gameStore'
import { deriveAkat, PlayerThrowInputSchema, RoundOverrideSchema } from '@/lib/schemas'
import type { PlayerThrowRecord } from '@/lib/schemas'
import { getPlayerPair } from '@/lib/playerPairing'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

function fieldErrors(field: AnyFieldApi): string {
  return field.state.meta.errors
    .filter(Boolean)
    .map(e => (typeof e === 'string' ? e : (e as { message?: string })?.message ?? String(e)))
    .join(', ')
}

interface TurnStepProps {
  state: GameState
}

export function TurnStep({ state }: TurnStepProps) {
  const { teams, rounds, roundIndex, turnIndex, playerThrowIndex, singleThrowIndex, fieldClearedBanner } = state
  const [editingEntry, setEditingEntry] = useState<{
    teamIndex: 0 | 1
    teamTurnIndex: number
    playerThrowIndex: 0 | 1 | 2 | 3
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

  // Cumulative single throws for the active team this round (for live akat derivation)
  const activeTurns = activeTeamIndex === 0 ? teamATurns : teamBTurns
  const precedingThrows = activeTurns.flatMap(t => Array.from(t.throws))

  return (
    <div className='mx-auto max-w-[600px] px-4 pt-20 space-y-6'>
      <Scoreboard
        teamAName={teams[0].name}
        teamBName={teams[1].name}
        round1={rounds[0]}
        round2={rounds[1]}
        roundIndex={roundIndex}
      />

      {/* Turns remaining info */}
      <div className='flex flex-wrap justify-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground'>
        <span>Erä {roundIndex + 1}</span>
        <span>•</span>
        <span className='font-bold'>{teams[0].name}: {turnsRemaining[0]} vuoroa jäljellä</span>
        <span>•</span>
        <span className='font-bold'>{teams[1].name}: {turnsRemaining[1]} vuoroa jäljellä</span>
      </div>

      {/* Field-cleared banner */}
      {fieldClearedBanner && (
        <div className='glass-panel rounded-2xl p-5 text-center space-y-3 border-green-300'>
          <p className='font-bold text-green-800 text-body-lg'>
            🎉 Kenttä tyhjä! {fieldClearedBanner.teamName} saa +{fieldClearedBanner.bonus} pistettä
          </p>
          <Button variant='outline' size='sm' onClick={dismissFieldClearedBanner}>
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
          key={`${editingEntry.teamIndex}-${editingEntry.teamTurnIndex}-${editingEntry.playerThrowIndex}`}
          teamName={teams[editingEntry.teamIndex].name}
          roundIdx={roundIndex}
          teamIndex={editingEntry.teamIndex}
          teamTurnIndex={editingEntry.teamTurnIndex}
          playerThrowIndex={editingEntry.playerThrowIndex}
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
          playerThrowIndex={playerThrowIndex}
          singleThrowIndex={singleThrowIndex}
          precedingThrows={precedingThrows}
        />
      )}

      {/* History panel */}
      {overrideTeam === null && editingEntry === null && (
        <HistoryPanel
          teams={teams}
          teamATurns={teamATurns}
          teamBTurns={teamBTurns}
          round={round ?? null}
          onEditThrow={(teamIndex, teamTurnIdx, throwIdx) =>
            setEditingEntry({ teamIndex, teamTurnIndex: teamTurnIdx, playerThrowIndex: throwIdx })}
          onOverride={teamIndex => setOverrideTeam(teamIndex)}
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
  playerThrowIndex,
  singleThrowIndex,
  precedingThrows,
}: {
  activeTeamName: string
  playerPair: [string, string]
  teamTurnIndex: number
  playerThrowIndex: 0 | 1
  singleThrowIndex: 0 | 1
  precedingThrows: PlayerThrowRecord[]
}) {
  const currentPlayerName = playerPair[playerThrowIndex]

  const form = useForm({
    defaultValues: { knockedOut: 0, pappiCount: 0 },
    validators: { onSubmit: PlayerThrowInputSchema },
    onSubmit: ({ value }) => {
      recordPlayerThrow(value.knockedOut, value.pappiCount)
      form.reset()
    },
  })

  return (
    <section className='glass-panel rounded-[2rem] p-8 space-y-8 shadow-md'>
      <div className='text-center space-y-1'>
        <h2 className='text-headline-md'>{activeTeamName}</h2>
        <div className='flex items-center justify-center gap-2'>
          <span className='text-label-caps text-muted-foreground'>Vuoro {teamTurnIndex + 1}/4</span>
          <span className='w-1 h-1 bg-border rounded-full' />
          <span className='text-label-caps text-primary'>Pelaaja {playerThrowIndex + 1}/2: {currentPlayerName}</span>
          <span className='w-1 h-1 bg-border rounded-full' />
          <span className='text-label-caps text-primary'>Heitto {singleThrowIndex + 1}/2</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className='space-y-8'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <form.Field name='knockedOut'>
            {field => (
              <NumberStepper
                label='Poistot'
                value={field.state.value}
                onChange={field.handleChange}
                field={field}
                highlight
              />
            )}
          </form.Field>

          <form.Field name='pappiCount'>
            {field => (
              <NumberStepper
                label='Papit'
                value={field.state.value}
                onChange={field.handleChange}
                field={field}
                min={-40}
              />
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={s => [s.values.knockedOut, s.values.pappiCount] as const}>
          {([knockedOut, pappiCount]) => {
            const allThrows = [...precedingThrows, { knockedOut, pappiCount }]
            const akat = Math.max(0, deriveAkat(allThrows))
            return (
              <p className='text-center text-label-caps text-muted-foreground/80'>
                Akat: <span className='text-foreground'>{akat}</span>
              </p>
            )
          }}
        </form.Subscribe>

        <button
          type='submit'
          className='w-full h-12 bg-primary-container text-primary-container-foreground rounded-xl font-bold text-body-lg active:scale-95 transition-all shadow-lg'
        >
          Vahvista
        </button>
      </form>
    </section>
  )
}

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditForm({
  teamName,
  roundIdx,
  teamIndex,
  teamTurnIndex,
  playerThrowIndex,
  existing,
  onSave,
  onCancel,
}: {
  teamName: string
  roundIdx: 0 | 1
  teamIndex: 0 | 1
  teamTurnIndex: number
  playerThrowIndex: 0 | 1 | 2 | 3
  existing?: TurnRecord
  onSave: () => void
  onCancel: () => void
}) {
  const targetThrow = existing?.throws[playerThrowIndex]
  const playerIndex = playerThrowIndex < 2 ? 0 : 1
  const throwIndexWithinPlayer = playerThrowIndex % 2

  const form = useForm({
    defaultValues: {
      knockedOut: targetThrow?.knockedOut ?? 0,
      pappiCount: targetThrow?.pappiCount ?? 0,
    },
    onSubmit: ({ value }) => {
      editPlayerThrow(
        roundIdx,
        teamIndex,
        teamTurnIndex,
        playerThrowIndex,
        value.knockedOut,
        value.pappiCount
      )
      onSave()
    },
  })

  const label = `Muokkaa: ${teamName} - vuoro ${teamTurnIndex + 1}, pelaaja ${playerIndex + 1}, heitto ${throwIndexWithinPlayer + 1}`

  return (
    <section className='glass-panel rounded-2xl p-6 space-y-4 shadow-md border-amber-200'>
      <div className='flex items-center justify-between'>
        <p className='font-semibold'>{label}</p>
        <Button type='button' variant='ghost' size='sm' onClick={onCancel}>
          Peruuta
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className='space-y-4'
      >
        <p className='text-label-caps text-muted-foreground'>
          Pelaaja {playerIndex + 1} · Heitto {throwIndexWithinPlayer + 1}
        </p>
        <div className='grid grid-cols-2 gap-6'>
          <form.Field name='knockedOut'>
            {field => (
              <NumberStepper
                label='Poistot'
                value={field.state.value}
                onChange={field.handleChange}
                field={field}
                highlight
              />
            )}
          </form.Field>

          <form.Field name='pappiCount'>
            {field => (
              <NumberStepper
                label='Papit'
                value={field.state.value}
                onChange={field.handleChange}
                field={field}
                min={-40}
              />
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={s => s.errors}>
          {(errors) => {
            const msg = errors
              .filter(Boolean)
              .map(e =>
                typeof e === 'string' ? e : (e as { message?: string })?.message ?? String(e)
              )
              .filter(Boolean)
              .join(', ')
            return msg
              ? (
                <p className='text-sm text-destructive text-center'>{msg}</p>
              )
              : null
          }}
        </form.Subscribe>

        <button
          type='submit'
          className='w-full h-12 bg-primary-container text-primary-container-foreground rounded-xl font-bold text-body-lg active:scale-95 transition-all shadow-lg'
        >
          Tallenna muutos
        </button>
      </form>
    </section>
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
    <section className='glass-panel rounded-2xl p-6 space-y-4 shadow-md border-amber-200'>
      <div className='flex items-center justify-between'>
        <p className='font-semibold'>Korjaa erätulos: {teamName}</p>
        <Button type='button' variant='ghost' size='sm' onClick={onCancel}>
          Peruuta
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className='space-y-4'
      >
        <form.Field name='points'>
          {field => (
            <div>
              <label htmlFor={field.name} className='text-label-caps text-muted-foreground block mb-2'>
                Erätulos (pistettä)
              </label>
              <input
                id={field.name}
                type='number'
                value={field.state.value}
                onChange={e => field.handleChange(e.target.valueAsNumber)}
                onBlur={field.handleBlur}
                className='w-full rounded-xl border-2 border-border bg-white px-3 py-3 text-xl font-bold text-center focus:outline-none focus:border-primary transition-colors'
              />
              {field.state.meta.errors.length > 0 && (
                <p className='mt-1 text-sm text-destructive'>
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <button
          type='submit'
          className='w-full h-12 bg-primary-container text-primary-container-foreground rounded-xl font-bold text-body-lg active:scale-95 transition-all shadow-lg'
        >
          Aseta tulos
        </button>
      </form>
    </section>
  )
}

// ── History panel ─────────────────────────────────────────────────────────────

function HistoryPanel({
  teams,
  teamATurns,
  teamBTurns,
  round,
  onEditThrow,
  onOverride,
}: {
  teams: GameState['teams']
  teamATurns: TurnRecord[]
  teamBTurns: TurnRecord[]
  round: RoundData | null
  onEditThrow: (teamIndex: 0 | 1, teamTurnIndex: number, playerThrowIndex: 0 | 1 | 2 | 3) => void
  onOverride: (teamIndex: 0 | 1) => void
}) {
  const totalTurns = teamATurns.length + teamBTurns.length
  if(totalTurns === 0) return null

  return (
    <section className='glass-panel rounded-2xl p-5 space-y-4 shadow-sm'>
      <h3 className='text-label-caps text-muted-foreground'>Kirjatut vuorot</h3>

      {([0, 1] as const).map((teamIdx) => {
        const turns = teamIdx === 0 ? teamATurns : teamBTurns
        const hasOverride =
          teamIdx === 0 ? round?.teamAOverride !== undefined : round?.teamBOverride !== undefined
        if(turns.length === 0) return null

        return (
          <div key={teamIdx} className='space-y-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-semibold'>{teams[teamIdx].name}</p>
              <Button
                type='button'
                variant='outline'
                size='xs'
                onClick={() => onOverride(teamIdx)}
              >
                {hasOverride ? '✏️ Korjattu' : 'Korjaa erätulos'}
              </Button>
            </div>
            {turns.map((turn, i) => (
              <div key={i} className='rounded-xl bg-white/60 px-3 py-2 space-y-1 border border-border/40'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground font-medium'>Vuoro {i + 1}</span>
                  <span>
                    {turn.result.fieldCleared
                      ? (
                        <span className='text-green-700 font-bold'>
                          Kenttä tyhjä! +{turn.result.unusedKartut}
                        </span>
                      )
                      : (
                        <span className='font-semibold'>{turn.result.points}p</span>
                      )}
                  </span>
                </div>
                {[0, 1].map((playerIdx) => {
                  const start = playerIdx * 2
                  const playerThrows = turn.throws.slice(start, start + 2)
                  if(playerThrows.length === 0) return null
                  return (
                    <div key={playerIdx} className='pl-2 space-y-1'>
                      <p className='text-xs font-semibold text-muted-foreground'>
                        Pelaaja {playerIdx + 1}
                      </p>
                      {playerThrows.map((playerthrow, idx) => {
                        const absoluteThrowIndex = (start + idx) as 0 | 1 | 2 | 3
                        return (
                          <div
                            key={absoluteThrowIndex}
                            className='flex items-center justify-between text-xs text-muted-foreground pl-2'
                          >
                            <span>
                              H{idx + 1}: poistot {playerthrow.knockedOut} · papit {playerthrow.pappiCount}
                            </span>
                            <Button
                              type='button'
                              variant='ghost'
                              size='xs'
                              onClick={() => onEditThrow(teamIdx, i, absoluteThrowIndex)}
                            >
                              Muokkaa
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )
      })}
    </section>
  )
}

// ── Number stepper ────────────────────────────────────────────────────────────

function NumberStepper({
  label,
  value,
  onChange,
  field,
  highlight = false,
  min = 0,
  max = 40,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  field: AnyFieldApi
  highlight?: boolean
  min?: number
  max?: number
}) {
  const errorMsg = fieldErrors(field)
  const isDecrementDisabled = value <= min
  const isIncrementDisabled = value >= max
  return (
    <div className='flex flex-col items-center gap-4'>
      <label className='text-label-caps text-muted-foreground'>{label}</label>
      <div className='flex items-center gap-4'>
        <button
          type='button'
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Vähennä ${label}`}
          className={cn('w-14 h-14 rounded-full border-2 border-border flex items-center justify-center active:scale-90 transition-transform bg-white/50 hover:bg-white text-xl font-bold text-accent-foreground',
            {
              'opacity-50 cursor-not-allowed': isDecrementDisabled,
            })}
          disabled={isDecrementDisabled}
        >
          <Minus size={16} strokeWidth={4} />
        </button>
        <div className={`w-24 h-24 bg-white rounded-2xl flex items-center justify-center border-2 shadow-inner ${highlight ? 'border-primary' : 'border-border'}`}>
          <input
            type='number'
            value={value}
            min={min}
            max={max}
            onChange={e => onChange(Math.max(min, Math.min(max, e.target.valueAsNumber || 0)))}
            className='w-full text-center text-score-display text-[48px] bg-transparent border-none focus:outline-none focus:ring-0'
          />
        </div>
        <button
          type='button'
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Lisää ${label}`}
          className={cn('w-14 h-14 rounded-full border-2 border-border flex items-center justify-center active:scale-90 transition-transform bg-white/50 hover:bg-white text-xl font-bold text-accent-foreground', {
            'opacity-50 cursor-not-allowed': isIncrementDisabled,
          })}
          disabled={isIncrementDisabled}
        >
          <Plus size={16} strokeWidth={4} />
        </button>
      </div>
      {errorMsg && (
        <p className='text-xs text-destructive text-center'>{errorMsg}</p>
      )}
    </div>
  )
}
