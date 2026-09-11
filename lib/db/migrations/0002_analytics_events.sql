DO $$ BEGIN
 CREATE TYPE "public"."analytics_event_type" AS ENUM('pageview', 'engagement', 'scroll', 'click', 'form_start', 'form_submit');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analytics_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "analytics_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" text NOT NULL,
	"event_type" "analytics_event_type" NOT NULL,
	"path" text NOT NULL,
	"referrer_host" text,
	"source_category" text,
	"device_type" text,
	"browser" text,
	"language" text,
	"viewport_width" integer,
	"target" text,
	"scroll_depth" integer,
	"active_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_event_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_session_id_idx" ON "analytics_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_path_idx" ON "analytics_events" USING btree ("path");
