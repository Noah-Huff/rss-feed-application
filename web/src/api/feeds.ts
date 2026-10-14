import type { Feed, FeedItem, ItemSortBy, SortOrder } from '../models/feedModel';
import { request } from './client'; // ← use the actual filename of your client file

export interface GetItemsParams {
  query?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}
export interface GetItemsParams {
  query?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
  sortBy?: ItemSortBy;
  order?: SortOrder;
}

export interface DiscoverFilters {
    query?: string | undefined,
    limit: number,
    offset: number
}

function toQueryString(params: GetItemsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function getItems(feedId: string, params: GetItemsParams = {}): Promise<FeedItem[]> {
  return request<FeedItem[]>(`/feeds/${feedId}/items${toQueryString(params)}`);
}

export function getAllItems(params: GetItemsParams = {}): Promise<FeedItem[]> {
  return request<FeedItem[]>(`/feeds/all${toQueryString(params)}`);
}

export function getFeeds(): Promise<Feed[]> {
  return request<Feed[]>('/feeds');
}

export function addFeed(url: string): Promise<Feed> {
  return request<Feed>('/feeds', { method: 'POST', body: { url } });
}

export function deleteFeed(id: string): Promise<void> {
  return request<void>(`/feeds/${id}`, { method: 'DELETE' });
}

export async function discoverFeeds(discoverFilters: DiscoverFilters): Promise<Feed[]> {
  return await request<Feed[]>(`/feeds/discover${toQueryString(discoverFilters)}`);
}