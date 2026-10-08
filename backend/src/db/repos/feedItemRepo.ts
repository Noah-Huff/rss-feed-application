import { and, desc, eq, gte, ilike, lte, notInArray, or, sql } from "drizzle-orm";
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
        .where(eq(feedItemsTable.id, feedId))
        .orderBy(
            sql`${feedItemsTable.publishedAt} desc nulls last`,
            desc(feedItemsTable.createdAt)
        )
        .limit(keep);
    
    await db 
        .delete(feedItemsTable)
        .where(
            and(
                eq(feedItemsTable.id, feedId),
                notInArray(feedItemsTable.id, keepers)
            )
        );
}   

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

    const items = await db
        .select()
        .from(feedItemsTable)
        .where(and(...conditions))
        .orderBy(
            sql`${feedItemsTable.publishedAt} desc nulls last`,
            desc(feedItemsTable.createdAt),
        )
        .limit(filter.limit)
        .offset(filter.offset);

    return items;
}