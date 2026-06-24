DO $$ BEGIN
 CREATE TYPE "public"."booking_status" AS ENUM('new', 'accepted', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."memory_category" AS ENUM('personal', 'goal', 'project', 'preference', 'decision', 'mistake', 'general');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."memory_relation" AS ENUM('leads_to', 'related_to', 'contradicts', 'supports');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."memory_session_event" AS ENUM('file_edit', 'decision', 'task', 'error', 'user_prompt', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bookings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pickup_location" text NOT NULL,
	"destination" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_last_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"scheduled_time" timestamp,
	"estimated_distance" real,
	"estimated_duration" real,
	"passenger_count" integer,
	"notes" text,
	"found_via" text,
	"later_pickup" text,
	"return_pickup_time" text,
	"return_pickup_location" text,
	"return_destination" text,
	"callback_time" timestamp,
	"status" "booking_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" text NOT NULL,
	"category" "memory_category" DEFAULT 'general' NOT NULL,
	"importance" real DEFAULT 0.5 NOT NULL,
	"embedding" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memory_connections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memory_connections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_id" integer NOT NULL,
	"target_id" integer NOT NULL,
	"relation" "memory_relation" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memory_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memory_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" text NOT NULL,
	"event_type" "memory_session_event" NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memory_connections" ADD CONSTRAINT "memory_connections_source_id_memories_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."memories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memory_connections" ADD CONSTRAINT "memory_connections_target_id_memories_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."memories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
