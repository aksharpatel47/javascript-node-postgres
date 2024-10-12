import 'dotenv/config';
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";
import { sites, siteUrlSlug } from './db/schema';
import { eq } from 'drizzle-orm';


type DrizzleDb = NodePgDatabase<typeof schema> & { $client: Pool };

async function main() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });
    const db: DrizzleDb = drizzle(pool, {schema});

    // Uncomment the following line to seed the database
    // await seed(db);

    // Strategy 1: Uses regular joins to query the data

    const sqlWithJoins = db.select().from(sites).leftJoin(siteUrlSlug, eq(sites.siteId, siteUrlSlug.siteId)).toSQL();

    console.log("SQL with joins");
    console.log(sqlWithJoins);
    /*
     * {
        sql: 'select "sites"."site_id", "sites"."uucode", "sites"."title", "sites"."description", "sites"."type", "sites"."hero_image_url", "sites"."is_active", "sites"."created_at", "sites"."created_by", "sites"."updated_at", "sites"."updated_by", "sites"."tags", "sites"."address", "site_url_slug"."site_url_slug_id", "site_url_slug"."site_id", "site_url_slug"."url_slug", "site_url_slug"."is_active", "site_url_slug"."created_at", "site_url_slug"."created_by", "site_url_slug"."updated_at", "site_url_slug"."updated_by" from "sites" left join "site_url_slug" on "sites"."site_id" = "site_url_slug"."site_id"',
        params: []
        }
     */
    
    const response = await db.execute(sqlWithJoins.sql);
    console.log("Count of rows returned: ", response.rowCount);
    // output: Count of rows returned: 1000

    // Strategy 2: Uses json aggregation to query the data

    const sql = db.query.sites.findMany({
        with: {
            siteUrlSlugs: true
        }
    }).toSQL();

    // either we can we the query method or do json aggregation with select

    console.log("SQL with json aggregation");
    console.log(sql);
    /*
     * {
        sql: `select "sites"."site_id", "sites"."uucode", "sites"."title", "sites"."description", "sites"."type", "sites"."hero_image_url", "sites"."is_active", "sites"."created_at", "sites"."created_by", "sites"."updated_at", "sites"."updated_by", "sites"."tags", "sites"."address", "sites_siteUrlSlugs"."data" as "siteUrlSlugs" from "sites" left join lateral (select coalesce(json_agg(json_build_array("sites_siteUrlSlugs"."site_url_slug_id", "sites_siteUrlSlugs"."site_id", "sites_siteUrlSlugs"."url_slug", "sites_siteUrlSlugs"."is_active", "sites_siteUrlSlugs"."created_at", "sites_siteUrlSlugs"."created_by", "sites_siteUrlSlugs"."updated_at", "sites_siteUrlSlugs"."updated_by")), '[]'::json) as "data" from "site_url_slug" "sites_siteUrlSlugs" where "sites_siteUrlSlugs"."site_id" = "sites"."site_id") "sites_siteUrlSlugs" on true`,
        params: []
        }
     */

    const response2 = await db.execute(sql.sql);
    console.log("Count of rows returned: ", response2.rowCount);
    // output: Count of rows returned: 100
    

}

async function seed(db: DrizzleDb) {
    const siteCount = 100;
    const siteUrlSlugCount = 1000;

    const sitesData = Array.from({ length: siteCount }, (_, i) => ({
      uucode: `site-${i}`,
      title: `Site ${i}`,
      description: `Description for site ${i}`,
      type: 'blog',
      heroImageUrl: `https://example.com/hero-image-${i}.jpg`,
      tags: ['tag1', 'tag2', 'tag3'],
      address: `123 Main St, Site ${i}`,
    }));

    const siteUrlSlugsData = Array.from({ length: siteUrlSlugCount }, (_, i) => ({
      siteId: Math.floor(Math.random() * siteCount) + 1,
      urlSlug: `url-slug-${i}`,
    }));

    await db.insert(sites).values(sitesData);
    await db.insert(siteUrlSlug).values(siteUrlSlugsData);
}

main();