CREATE TABLE IF NOT EXISTS "pageview_counters" (
	"bucket_hour" timestamp with time zone NOT NULL,
	"path" text NOT NULL,
	"referrer_host" text NOT NULL,
	"is_bot" boolean NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "pageview_counters_pkey" PRIMARY KEY("bucket_hour","path","referrer_host","is_bot")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageview_counters_bucket_hour_idx" ON "pageview_counters" USING btree ("bucket_hour");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageview_counters_path_idx" ON "pageview_counters" USING btree ("path");
