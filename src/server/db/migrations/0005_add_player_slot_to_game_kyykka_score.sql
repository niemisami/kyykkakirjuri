DROP INDEX "game_kyykka_score_unique_idx";--> statement-breakpoint
ALTER TABLE "game_kyykka_score" ADD COLUMN "player_slot" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "game_kyykka_score_unique_idx" ON "game_kyykka_score" USING btree ("game_id","team_id","round","turn","player_slot","throw_index");