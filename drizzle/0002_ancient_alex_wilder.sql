CREATE TABLE "user_sync_state" (
	"user_id" text PRIMARY KEY NOT NULL,
	"backfilled_at" timestamp DEFAULT now() NOT NULL
);
