import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { feedsTable, subscriptionsTable } from "../schema.js"

export type Feed = typeof feedsTable.$inferSelect;

const feedColumns = {
    id: feedsTable.id,
    url: feedsTable.url,
    title: feedsTable.title,
    lastFetchedAt: feedsTable.lastFetchedAt,
    createdAt: feedsTable.createdAt,
}

export async function findFeedByUrl(url: string): Promise<Feed | undefined> {
    const [feed] = await db
        .select()
        .from(feedsTable)
        .where(eq(feedsTable.url, url))
        .limit(1);

    return feed;
}

export async function insertFeed(url: string, title: string): Promise<Feed | undefined> {
    const [feed] = await db
        .insert(feedsTable)
        .values({ url, title })
        .onConflictDoNothing({ target: feedsTable.url })
        .returning();

    return feed;
}

export async function subscribeToFeed(userId: string, feedId: string): Promise<void> {
    await db
        .insert(subscriptionsTable)
        .values({ userId, feedId })
        .onConflictDoNothing();
}

export async function unsubscribeFromFeed(userId: string, feedId: string): Promise<void> {
    await db
        .delete(subscriptionsTable)
        .where(and(
            eq(subscriptionsTable.userId, userId),
            eq(subscriptionsTable.feedId, feedId)
        ));
}

export async function listFeedsForUser(userId: string): Promise<Feed[] | undefined> {
    const feeds = await db
        .select({...feedColumns})
        .from(subscriptionsTable)
        .innerJoin(feedsTable, eq(subscriptionsTable.feedId, feedsTable.id))
        .where(eq(subscriptionsTable.userId, userId));

    return feeds;
}

export async function findSubscribedFeed(userId: string, feedId: string): Promise<Feed | undefined> {
    const [feed] = await db
        .select({...feedColumns})
        .from(subscriptionsTable)
        .innerJoin(feedsTable, eq(subscriptionsTable.feedId, feedsTable.id))
        .where(and(
            eq(subscriptionsTable.userId, userId),
            eq(subscriptionsTable.feedId, feedId)
        ))
        .limit(1);
    
    return feed;
}

export async function markFetched(feedId: string): Promise<void> {
    await db
        .update(feedsTable)
        .set({ lastFetchedAt: new Date() })
        .where(eq(feedsTable.id, feedId))
}
