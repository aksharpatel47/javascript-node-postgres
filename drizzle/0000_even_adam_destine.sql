CREATE TABLE IF NOT EXISTS "site_url_slug" (
	"site_url_slug_id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"url_slug" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sites" (
	"site_id" serial PRIMARY KEY NOT NULL,
	"uucode" varchar NOT NULL,
	"title" varchar,
	"description" text,
	"type" varchar,
	"hero_image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" boolean,
	"updated_at" timestamp,
	"updated_by" boolean,
	"tags" jsonb,
	"address" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_url_slug" ADD CONSTRAINT "site_url_slug_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("site_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
