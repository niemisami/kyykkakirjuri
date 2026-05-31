ALTER TABLE "player" DROP CONSTRAINT "player_default_team_id_team_team_id_fk";
--> statement-breakpoint
ALTER TABLE "player" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "player" ADD CONSTRAINT "player_team_id_team_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player" DROP COLUMN "default_team_id";