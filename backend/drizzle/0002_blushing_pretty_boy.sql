CREATE TABLE "feed_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_id" uuid NOT NULL,
	"guid" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"link" text NOT NULL,
	"image_url" text,
	"published_at" timestamp,
	"create_ag" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feed_items_feedId_guid_unique" UNIQUE("feed_id","guid")
);
--> statement-breakpoint
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_feed_id_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."feeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feed_items_feed_id_published_at_index" ON "feed_items" USING btree ("feed_id","published_at");