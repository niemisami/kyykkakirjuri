import { relations } from 'drizzle-orm'

import { event } from './event'
import { game } from './game'
import { gameKyykkaScore } from './gameKyykkaScore'
import { gameTeam } from './gameTeam'
import { gameTeamPlayer } from './gameTeamPlayer'
import { player } from './player'
import { team } from './team'

export const teamRelations = relations(team, ({ many }) => ({
  players: many(player),
  gameTeams: many(gameTeam),
  gameTeamPlayers: many(gameTeamPlayer),
  gameKyykkaScores: many(gameKyykkaScore),
}))

export const playerRelations = relations(player, ({ one, many }) => ({
  defaultTeam: one(team, {
    fields: [player.defaultTeamId],
    references: [team.id],
  }),
  gameTeamPlayers: many(gameTeamPlayer),
  gameKyykkaScores: many(gameKyykkaScore),
}))

export const eventRelations = relations(event, ({ many }) => ({
  games: many(game),
}))

export const gameRelations = relations(game, ({ one, many }) => ({
  event: one(event, {
    fields: [game.eventId],
    references: [event.id],
  }),
  gameTeams: many(gameTeam),
  gameTeamPlayers: many(gameTeamPlayer),
  gameKyykkaScores: many(gameKyykkaScore),
}))

export const gameTeamRelations = relations(gameTeam, ({ one }) => ({
  team: one(team, {
    fields: [gameTeam.teamId],
    references: [team.id],
  }),
  game: one(game, {
    fields: [gameTeam.gameId],
    references: [game.id],
  }),
}))

export const gameTeamPlayerRelations = relations(gameTeamPlayer, ({ one }) => ({
  team: one(team, {
    fields: [gameTeamPlayer.teamId],
    references: [team.id],
  }),
  game: one(game, {
    fields: [gameTeamPlayer.gameId],
    references: [game.id],
  }),
  player: one(player, {
    fields: [gameTeamPlayer.playerId],
    references: [player.id],
  }),
}))

export const gameKyykkaScoreRelations = relations(gameKyykkaScore, ({ one }) => ({
  team: one(team, {
    fields: [gameKyykkaScore.teamId],
    references: [team.id],
  }),
  game: one(game, {
    fields: [gameKyykkaScore.gameId],
    references: [game.id],
  }),
  player: one(player, {
    fields: [gameKyykkaScore.playerId],
    references: [player.id],
  }),
}))
