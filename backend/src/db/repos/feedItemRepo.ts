import { and, asc, desc, eq, getTableColumns, gte, ilike, lte, notInArray, or, SQL, sql } from "drizzle-orm";
import { db } from "../index.js";
import { feedItemsTable, feedsTable, subscriptionsTable } from "../schema.js";
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

function buildConditions(f: ItemFilters): SQL[] {
    const conditions: SQL[] = [];
    if (f.query) {
        const pattern = `%${f.query}%`;
        conditions.push(or(
            ilike(feedItemsTable.title, pattern),
            ilike(feedItemsTable.description, pattern),
        )!);
    }
    if (f.from) conditions.push(gte(feedItemsTable.publishedAt, f.from));
    if (f.to) conditions.push(lte(feedItemsTable.publishedAt, f.to));
    return conditions;
}

function buildOrderBy(f: ItemFilters) {
    const column = SORT_COLUMNS[f.sortBy];
    const direction = f.order === 'asc' ? sql`asc` : sql`desc`;

    return [
        sql`${column} ${direction} nulls last`,
        desc(feedItemsTable.createdAt),
        asc(feedItemsTable.id),
    ];
}

const SORT_COLUMNS = {
    publishedAt: feedItemsTable.publishedAt,
    title: feedItemsTable.title,
    description: feedItemsTable.description,
} as const;

export async function queryItems(feedId: string, filter: ItemFilters): Promise<StoredFeedItem[]> {
    const column = SORT_COLUMNS[filter.sortBy];
    const direction = filter.order === 'asc' ? sql`asc` : sql`desc`;

    const items = await db
        .select()
        .from(feedItemsTable)
        .where(and(eq(feedItemsTable.feedId, feedId), ...buildConditions(filter)))
        .orderBy(...buildOrderBy(filter))
        .limit(filter.limit)
        .offset(filter.offset);

    return items;
}

export async function queryItemsForUser(userId: string, f: ItemFilters) {
    const items = await db
        .select({ ...getTableColumns(feedItemsTable), feedTitle: feedsTable.title })
        .from(feedItemsTable)
        .innerJoin(subscriptionsTable, eq(subscriptionsTable.feedId, feedItemsTable.feedId))
        .innerJoin(feedsTable, eq(feedsTable.id, feedItemsTable.feedId))
        .where(and(eq(subscriptionsTable.userId, userId), ...buildConditions(f)))
        .orderBy(...buildOrderBy(f)) 
        .limit(f.limit)
        .offset(f.offset);

    return items;
}