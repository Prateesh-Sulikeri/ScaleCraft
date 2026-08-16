CREATE TABLE "saved_graphs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"scope_id" text NOT NULL,
	"graph" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
