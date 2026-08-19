ALTER TABLE "bug_reports" ADD COLUMN "closing_notes" text;--> statement-breakpoint
ALTER TABLE "bug_reports" ADD COLUMN "seen_status" text DEFAULT 'open' NOT NULL;