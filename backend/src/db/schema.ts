import { pgTable, varchar, uuid, timestamp, text, index, primaryKey, unique } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: timestamp().notNull().defaultNow()
});

export const feedsTable = pgTable("feeds", {
  id: uuid().primaryKey().defaultRandom(),
  url: text().notNull().unique(),
  title: text().notNull(),
  lastFetchedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow()
});

export const subscriptionsTable = pgTable("subscriptions", {
  userId: uuid().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  feedId: uuid().notNull().references(() => feedsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow()
}, (t) => [
  primaryKey({ columns: [t.userId, t.feedId] }),
  index().on(t.feedId)
]);

export const feedItemsTable = pgTable("feed_items", {
  id: uuid().primaryKey().defaultRandom(),
  feedId: uuid().notNull().references(() => feedsTable.id, { onDelete: "cascade" }),
  guid: text().notNull(),
  title: text().notNull(),
  description: text().notNull(),
  link: text().notNull(),
  imageUrl: text(),
  publishedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow()
}, (t) => [
  unique().on(t.feedId, t.guid),
  index().on(t.feedId, t.publishedAt)
]);