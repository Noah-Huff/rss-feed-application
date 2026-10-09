import type { ItemSortBy, SortOrder } from "../schemas/feed.js";

export interface GetFeed {
    imageUrl: string;
    title: string;
    pubDate: string;
    description: string;
}

export interface FeedItem {
  guid: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string | null;
  publishedAt: Date | null;
}

export interface ParsedFeed {
    title: string;
    items: FeedItem[];
}

export interface ItemFilters {
  query?: string | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
  limit: number;
  offset: number;
  sortBy: ItemSortBy;
  order: SortOrder;
}
