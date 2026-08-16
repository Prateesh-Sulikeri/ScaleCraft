TRUNCATE TABLE "saved_graphs";
--> statement-breakpoint
ALTER TABLE "saved_graphs" DROP COLUMN "graph";
--> statement-breakpoint
ALTER TABLE "saved_graphs" ADD COLUMN "canvas_state" jsonb NOT NULL;
