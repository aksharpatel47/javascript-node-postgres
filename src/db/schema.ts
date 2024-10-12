import { relations } from 'drizzle-orm';
import {
  serial,
  varchar,
  text,
  jsonb,
  boolean,
  timestamp,
  integer,
  pgTable,
} from 'drizzle-orm/pg-core';

export const sites = pgTable('sites', {
  siteId: serial('site_id').primaryKey(),
  uucode: varchar('uucode').notNull(),
  title: varchar('title'),
  description: text('description'),
  type: varchar('type'),
  heroImageUrl: text('hero_image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: boolean('created_by'),
  updatedAt: timestamp('updated_at'),
  updatedBy: boolean('updated_by'),
  tags: jsonb('tags'),
  address: varchar('address'),
});

export const siteSlugRelations = relations(sites, ({ many }) => ({
  siteUrlSlugs: many(siteUrlSlug),
}));

export const siteUrlSlug = pgTable('site_url_slug', {
  siteUrlSlugId: serial('site_url_slug_id').primaryKey(),
  siteId: integer('site_id')
    .notNull()
    .references(() => sites.siteId),
  urlSlug: varchar('url_slug', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: integer('created_by'),
  updatedAt: timestamp('updated_at'),
  updatedBy: integer('updated_by'),
});

export const siteUrlSlugRelations = relations(siteUrlSlug, ({ one }) => ({
  site: one(sites, {
    fields: [siteUrlSlug.siteId],
    references: [sites.siteId],
  }),
}));
