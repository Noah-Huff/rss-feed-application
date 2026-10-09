import { pruneItems, upsertItems } from "../db/repos/feedItemRepo.js";
import { findFeedByUrl, insertFeed, listFeedsForUser, markFetched, subscribeToFeed, unsubscribeFromFeed, type Feed } from "../db/repos/feedsRepo.js";
import type { FeedItem } from "../types/feed.js";
import { fetchAndParseFeed } from "../utils/feedParser.js";
import { normalizeUrl } from "../utils/feedUrl.js";

const MAX_ITEMS = Number(process.env.FEED_MAX_ITEMS) || 50;

console.log('MAX_ITEMS: ' + MAX_ITEMS);

export const listFeeds = (userId: string) => listFeedsForUser(userId);
export const unsubscribe = (userId: string, feedId: string) => unsubscribeFromFeed(userId, feedId);

function sortNewestFirst(items: FeedItem[]): FeedItem[] {
    return [...items].sort((a, b) => {
        if (a.publishedAt && b.publishedAt) {
            return b.publishedAt.getTime() - a.publishedAt.getTime();
        }
        if (a.publishedAt) return -1;   // dated before undated
        if (b.publishedAt) return 1;
        return 0;                        // both undated: keep feed order
    });
}

export async function refreshFeed(feed: Feed): Promise<void> {
    const parsed = await fetchAndParseFeed(feed.url);
    const newest = sortNewestFirst(parsed.items).slice(0, MAX_ITEMS);

    await upsertItems(feed.id, newest);
    await pruneItems(feed.id, MAX_ITEMS);
    await markFetched(feed.id);
}

export async function addFeed(userId: string, rawUrl: string): Promise<Feed> {
    const url = normalizeUrl(rawUrl);

    let feed = await findFeedByUrl(url);

    if (!feed) {
        const parsed = await fetchAndParseFeed(url); // this is the validation
        feed = (await insertFeed(url, parsed.title)) ?? (await findFeedByUrl(url));
        if (!feed) throw new Error("Failed to create feed");
        await refreshFeed(feed);
    }

    await subscribeToFeed(userId, feed.id);
    return feed;
}