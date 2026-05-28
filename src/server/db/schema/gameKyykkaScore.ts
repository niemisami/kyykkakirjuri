import { integer, pgTable, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { game } from './game'
import { player } from './player'
import { team } from './team'

export const gameKyykkaScore = pgTable('game_kyykka_score', {
  scoreId: integer('score_id').primaryKey().generatedAlwaysAsIdentity(),
  teamId: integer('team_id').notNull().references(() => team.id),
  gameId: integer('game_id').notNull().references(() => game.id),
  playerId: integer('player_id').references(() => player.id), // nullable
  turn: integer('turn').notNull(),
  round: integer('round').notNull(),
  scoreAkka: integer('score_akka').notNull(),
  scorePappi: integer('score_pappi').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).$default(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$default(() => new Date()).$onUpdate(() => new Date()).notNull(),
},
table => [
  uniqueIndex('game_kyykka_score_unique_idx').on(table.teamId, table.gameId, table.playerId, table.turn, table.round),
])
