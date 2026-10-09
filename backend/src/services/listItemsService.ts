import { queryItems, queryItemsForUser, type StoredFeedItem } from "../db/repos/feedItemRepo.js";
import { findSubscribedFeed, listFeedsForUser, type Feed } from "../db/repos/feedsRepo.js";
import { NotFoundError } from "../errors.js";
import type { ItemFilters } from "../types/feed.js";
import { refreshFeed } from "./feedService.js";

const REFRESH_MS = (Number(process.env.FEED_REFRESH_MINUTES) || 15) * 60_000;

function isStale(feed: Feed): boolean {
    return !feed.lastFetchedAt || Date.now() - feed.lastFetchedAt.getTime() > REFRESH_MS;
}

export async function listItems(
    userId: string,
    feedId: string,
    filters: ItemFilters,
): Promise<StoredFeedItem[]> {
    const feed = await findSubscribedFeed(userId, feedId);
    if (!feed) throw new NotFoundError("Feed not found");

    const stale = isStale(feed);

    if (stale) {
        try {
            await refreshFeed(feed);
        } catch (err) {
            console.error(`Refresh failed for feed ${feed.id}`, err);
        }
    }

    return queryItems(feed.id, filters);
}

export async function listAllItems(userId: string, filters: ItemFilters) {
    const feeds = (await listFeedsForUser(userId)) ?? [];
    await Promise.allSettled(feeds.filter(isStale).map(refreshFeed));
    return queryItemsForUser(userId, filters);
}