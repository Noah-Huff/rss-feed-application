import { and, asc, desc, eq, gte, ilike, lte, notInArray, or, sql } from "drizzle-orm";
import { db } from "../index.js";
import { feedItemsTable } from "../schema.js";
import type { FeedItem, ItemFilters } from "../../types/feed.js";

export type StoredFeedItem = typeof feedItemsTable.$inferSelect;

export async function upsertItems(feedId: string, items: FeedItem[]): Promise<void> {
    if (items.length < 1) return;

    await db
        .insert(feedItemsTable)
        .values(items.map((i) => ({ ...i, feedId })))
        .onConflictDoNothing({
            target: [feedItemsTable.feedId, feedItemsTable.guid]
        })
}

export async function pruneItems(feedId: string, keep: number): Promise<void> {
    const keepers = db
        .select({ id: feedItemsTable.id })
        .from(feedItemsTable)
        .where(eq(feedItemsTable.feedId, feedId))
        .orderBy(
            sql`${feedItemsTable.publishedAt} desc nulls last`,
            desc(feedItemsTable.createdAt)
        )
        .limit(keep);

    await db
        .delete(feedItemsTable)
        .where(
            and(
                eq(feedItemsTable.feedId, feedId),
                notInArray(feedItemsTable.id, keepers)
            )
        );
}

const SORT_COLUMNS = {
    publishedAt: feedItemsTable.publishedAt,
    title: feedItemsTable.title,
    description: feedItemsTable.description,
} as const;

export async function queryItems(feedId: string, filter: ItemFilters): Promise<StoredFeedItem[]> {
    const conditions = [eq(feedItemsTable.feedId, feedId)];

    if (filter.query) {
        const pattern = `%${filter.query}%`;
        conditions.push(or(
            ilike(feedItemsTable.title, pattern),
            ilike(feedItemsTable.description, pattern),
        )!);
    }
    if (filter.from) conditions.push(gte(feedItemsTable.publishedAt, filter.from));
    if (filter.to) conditions.push(lte(feedItemsTable.publishedAt, filter.to));

    const column = SORT_COLUMNS[filter.sortBy];
    const direction = filter.order === 'asc' ? sql`asc` : sql`desc`;

    const items = await db
        .select()
        .from(feedItemsTable)
        .where(and(...conditions))
        .orderBy(
            sql`${column} ${direction} nulls last`,
            desc(feedItemsTable.createdAt),
            asc(feedItemsTable.id),
        )
        .limit(filter.limit)
        .offset(filter.offset);

    return items;
}