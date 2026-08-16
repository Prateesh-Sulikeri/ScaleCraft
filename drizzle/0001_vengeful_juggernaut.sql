CREATE TABLE "chapter_progress" (
	"user_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"completed_at" timestamp NOT NULL,
	"matched_blueprint_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chapter_progress_user_id_chapter_id_pk" PRIMARY KEY("user_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE "curriculum_progress" (
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"manually_completed_at" timestamp,
	"last_visited_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "curriculum_progress_user_id_slug_pk" PRIMARY KEY("user_id","slug")
);
--> statement-breakpoint
CREATE TABLE "custom_components" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"label" text NOT NULL,
	"icon" text NOT NULL,
	"summary" text NOT NULL,
	"docs" text NOT NULL,
	"has_input" boolean NOT NULL,
	"has_output" boolean NOT NULL,
	"fields" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deep_check_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"save_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"critique" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_attempts" (
	"user_id" text NOT NULL,
	"chapter_definition_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"submitted_at" timestamp NOT NULL,
	"score" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exam_attempts_user_id_chapter_definition_id_attempt_number_pk" PRIMARY KEY("user_id","chapter_definition_id","attempt_number")
);
