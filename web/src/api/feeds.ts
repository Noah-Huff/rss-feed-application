import type { Feed, FeedItem } from '../models/feedModel';
import { request } from './client'; // ← use the actual filename of your client file

export interface GetItemsParams {
  query?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
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

export function getItems(feedId: string, params: GetItemsParams = {}): Promise<FeedItem[]> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return request<FeedItem[]>(`/feeds/${feedId}/items${qs ? `?${qs}` : ''}`);
}