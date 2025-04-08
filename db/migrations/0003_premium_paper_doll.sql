CREATE TYPE "public"."membership" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TABLE "customers" (
	"user_id" text PRIMARY KEY NOT NULL,
	"membership" "membership" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS "folders" CASCADE;--> statement-breakpoint
ALTER TABLE IF EXISTS "prompts" DROP CONSTRAINT IF EXISTS "prompts_folder_id_folders_id_fk";
--> statement-breakpoint
ALTER TABLE IF EXISTS "prompts" DROP COLUMN IF EXISTS "folder_id";