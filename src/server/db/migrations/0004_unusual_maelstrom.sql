ALTER TABLE "game_kyykka_score" RENAME COLUMN "score_akka" TO "knocked_out";--> statement-breakpoint
ALTER TABLE "game_kyykka_score" RENAME COLUMN "score_pappi" TO "pappi_count";--> statement-breakpoint
DROP INDEX "game_kyykka_score_unique_idx";--> statement-breakpoint
ALTER TABLE "game" ALTER COLUMN "started_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "game" ALTER COLUMN "ended_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "game" ALTER COLUMN "sport" SET DEFAULT 'kyykkä';--> statement-breakpoint
ALTER TABLE "game_kyykka_score" ALTER COLUMN "player_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "game_team_player" ADD COLUMN "round" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "game_kyykka_score" ADD COLUMN "throw_index" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "game_kyykka_score_unique_idx" ON "game_kyykka_score" USING btree ("game_id","team_id","player_id","round","turn","throw_index");