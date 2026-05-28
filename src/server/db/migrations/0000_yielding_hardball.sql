CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"team_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "team_team_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"name" varchar(255) NOT NULL,
	"home" varchar(255),
	"description" text,
	"contact_email" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "player" (
	"player_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "player_player_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"default_team_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"event_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "event_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"date" timestamp with time zone NOT NULL,
	"team_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game" (
	"game_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "game_game_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL,
	"event_id" integer,
	"location" varchar(255),
	"description" text,
	"sport" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_team" (
	"game_team_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "game_team_game_team_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"team_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"home" varchar(255),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "game_team_player" (
	"game_team_player_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "game_team_player_game_team_player_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"team_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_kyykka_score" (
	"score_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "game_kyykka_score_score_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"team_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"player_id" integer,
	"turn" integer NOT NULL,
	"round" integer NOT NULL,
	"score_akka" integer NOT NULL,
	"score_pappi" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player" ADD CONSTRAINT "player_default_team_id_team_team_id_fk" FOREIGN KEY ("default_team_id") REFERENCES "public"."team"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_event_id_event_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_team" ADD CONSTRAINT "game_team_team_id_team_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_team" ADD CONSTRAINT "game_team_game_id_game_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("game_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_team_player" ADD CONSTRAINT "game_team_player_team_id_team_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_team_player" ADD CONSTRAINT "game_team_player_game_id_game_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("game_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_team_player" ADD CONSTRAINT "game_team_player_player_id_player_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("player_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_kyykka_score" ADD CONSTRAINT "game_kyykka_score_team_id_team_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_kyykka_score" ADD CONSTRAINT "game_kyykka_score_game_id_game_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("game_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_kyykka_score" ADD CONSTRAINT "game_kyykka_score_player_id_player_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("player_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "game_kyykka_score_unique_idx" ON "game_kyykka_score" USING btree ("team_id","game_id","player_id","turn","round");