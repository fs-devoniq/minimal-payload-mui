import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "site_name" SET DEFAULT 'My Website';
  ALTER TABLE "settings" ALTER COLUMN "site_url" SET DEFAULT 'http://localhost:3000';
  ALTER TABLE "settings" ALTER COLUMN "default_title" SET DEFAULT 'My Website';
  ALTER TABLE "settings" ALTER COLUMN "title_template" SET DEFAULT '%s | My Website';
  ALTER TABLE "settings" ALTER COLUMN "default_description" SET DEFAULT 'A site built with Payload CMS and Next.js.';
  ALTER TABLE "settings" ADD COLUMN "home_page_id" integer NOT NULL;
  ALTER TABLE "settings" ADD COLUMN "colors_primary" varchar DEFAULT '#90FF00';
  ALTER TABLE "settings" ADD COLUMN "colors_secondary" varchar DEFAULT 'rgba(171, 234, 255, 0.08)';
  ALTER TABLE "settings" ADD COLUMN "colors_background_default" varchar DEFAULT '#050810';
  ALTER TABLE "settings" ADD COLUMN "colors_background_paper" varchar DEFAULT 'rgba(255, 255, 255, 0.01)';
  ALTER TABLE "settings" ADD COLUMN "colors_text_primary" varchar DEFAULT '#DBE9FF';
  ALTER TABLE "settings" ADD COLUMN "colors_text_secondary" varchar DEFAULT '#90FF00';
  ALTER TABLE "settings" ADD COLUMN "colors_success" varchar DEFAULT '#90FF00';
  ALTER TABLE "settings" ADD COLUMN "colors_error" varchar DEFAULT '#ff1744';
  ALTER TABLE "settings" ADD CONSTRAINT "settings_home_page_id_pages_id_fk" FOREIGN KEY ("home_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "settings_home_page_idx" ON "settings" USING btree ("home_page_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP CONSTRAINT "settings_home_page_id_pages_id_fk";
  
  DROP INDEX "settings_home_page_idx";
  ALTER TABLE "settings" ALTER COLUMN "site_name" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "site_url" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "default_title" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "title_template" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "default_description" DROP DEFAULT;
  ALTER TABLE "settings" DROP COLUMN "home_page_id";
  ALTER TABLE "settings" DROP COLUMN "colors_primary";
  ALTER TABLE "settings" DROP COLUMN "colors_secondary";
  ALTER TABLE "settings" DROP COLUMN "colors_background_default";
  ALTER TABLE "settings" DROP COLUMN "colors_background_paper";
  ALTER TABLE "settings" DROP COLUMN "colors_text_primary";
  ALTER TABLE "settings" DROP COLUMN "colors_text_secondary";
  ALTER TABLE "settings" DROP COLUMN "colors_success";
  ALTER TABLE "settings" DROP COLUMN "colors_error";`)
}
