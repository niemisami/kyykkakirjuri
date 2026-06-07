import { integer, pgTable, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { game } from './game'
import { player } from './player'
import { team } from './team'

export const gameKyykkaScore = pgTable('game_kyykka_score', {
  scoreId: integer('score_id').primaryKey().generatedAlwaysAsIdentity(),
  teamId: integer('team_id').notNull().references(() => team.id),
  gameId: integer('game_id').notNull().references(() => game.id),
  playerId: integer('player_id').notNull().references(() => player.id),
  round: integer('round').notNull(),
  turn: integer('turn').notNull(),
  /** 0-based index of this single throw within the player's two kartut in a turn (0 or 1) */
  throwIndex: integer('throw_index').notNull(),
  knockedOut: integer('knocked_out').notNull(),
  pappiCount: integer('pappi_count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).$default(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$default(() => new Date()).$onUpdate(() => new Date()).notNull(),
},
table => [
  uniqueIndex('game_kyykka_score_unique_idx').on(table.gameId, table.teamId, table.playerId, table.round, table.turn, table.throwIndex),
])
