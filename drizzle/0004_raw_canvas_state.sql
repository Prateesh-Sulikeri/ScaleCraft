TRUNCATE TABLE "saved_graphs";
ALTER TABLE "saved_graphs" DROP COLUMN "graph";
ALTER TABLE "saved_graphs" ADD COLUMN "canvas_state" jsonb NOT NULL;
