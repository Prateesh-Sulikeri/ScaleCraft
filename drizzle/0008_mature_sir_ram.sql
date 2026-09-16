-- Bug report retention (.claude/docs/pending-bug-retention.md): the 15-day
-- purge clock and the record of a deleted attachment.
--
-- No backfill on purpose. Reports already sitting at resolved/closed get
-- closed_at = null here, and the first sweep stamps them with now(), so they
-- get a full 15 days from the day this ships rather than being purged on
-- arrival off an updated_at that could mean anything.
ALTER TABLE "bug_reports" ADD COLUMN "closed_at" timestamp;--> statement-breakpoint
ALTER TABLE "bug_reports" ADD COLUMN "image_deleted_at" timestamp;