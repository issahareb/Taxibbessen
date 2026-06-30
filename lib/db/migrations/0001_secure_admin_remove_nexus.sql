DROP TABLE IF EXISTS "memory_connections" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "memory_sessions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "memories" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."memory_relation";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."memory_session_event";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."memory_category";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_credentials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_credentials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"csrf_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");
