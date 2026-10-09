export interface Feed {
  id: string;
  url: string;
  title: string;
  lastFetchedAt: string | null;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  feedId: string;
  guid: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export type ItemSortBy = 'publishedAt' | 'title' | 'description';
export type SortOrder = 'asc' | 'desc';