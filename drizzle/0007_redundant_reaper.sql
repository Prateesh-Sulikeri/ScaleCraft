-- exam_attempts: one row per submission -> one row per chapter, holding the
-- best attempt plus a count of how many were taken. The generated version of
-- this migration added the new primary key before collapsing the duplicate
-- rows it would reject, and added total_attempts NOT NULL with no value for
-- existing rows, so the steps below are ordered by hand: count, collapse,
-- then re-key. No temp tables - the HTTP driver may put each statement on its
-- own connection.
ALTER TABLE "exam_attempts" ADD COLUMN "total_attempts" integer;--> statement-breakpoint

-- Stamp every row of a chapter with that chapter's attempt count, while the
-- rows being discarded below are still there to be counted.
UPDATE "exam_attempts" e
SET "total_attempts" = c."n"
FROM (
  SELECT "user_id", "chapter_definition_id", count(*)::int AS "n"
  FROM "exam_attempts"
  GROUP BY "user_id", "chapter_definition_id"
) c
WHERE e."user_id" = c."user_id" AND e."chapter_definition_id" = c."chapter_definition_id";--> statement-breakpoint

-- Keep only the best attempt per (user, chapter). Ties keep the earliest, then
-- the lowest attempt number: that is when the score was first reached. Same
-- rule as the Dexie v13 upgrade in src/persistence/db.ts.
DELETE FROM "exam_attempts"
WHERE ("user_id", "chapter_definition_id", "attempt_number") NOT IN (
  SELECT DISTINCT ON ("user_id", "chapter_definition_id")
    "user_id", "chapter_definition_id", "attempt_number"
  FROM "exam_attempts"
  ORDER BY "user_id", "chapter_definition_id", "score" DESC, "submitted_at" ASC, "attempt_number" ASC
);--> statement-breakpoint

ALTER TABLE "exam_attempts" ALTER COLUMN "total_attempts" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_attempts" DROP CONSTRAINT "exam_attempts_user_id_chapter_definition_id_attempt_number_pk";--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_chapter_definition_id_pk" PRIMARY KEY("user_id","chapter_definition_id");--> statement-breakpoint
ALTER TABLE "exam_attempts" DROP COLUMN "attempt_number";
