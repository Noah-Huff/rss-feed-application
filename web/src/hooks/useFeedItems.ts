import { useEffect, useState } from 'react';
import { getItems, type GetItemsParams } from '../api/feeds';
import { ApiError } from '../models/errors';
import type { FeedItem, ItemSortBy, SortOrder } from '../models/feedModel';

const PAGE_SIZE = Number(import.meta.env.VITE_FEED_PAGE_SIZE) || 20;

export interface ItemFilterValues {
  query: string;
  from: string;
  to: string;
  sortBy: ItemSortBy;
  order: SortOrder;
}

export const emptyFilters: ItemFilterValues = {
  query: '', from: '', to: '', sortBy: 'publishedAt', order: 'desc',
};

function toIso(date: string, endOfDay: boolean): string {
  if (!date) return '';
  const time = endOfDay ? 'T23:59:59.999' : 'T00:00:00';
  return new Date(`${date}${time}`).toISOString();
}

function buildParams(filters: ItemFilterValues, page: number): GetItemsParams {
  return {
    query: filters.query,
    from: toIso(filters.from, false),
    to: toIso(filters.to, true),
    sortBy: filters.sortBy,
    order: filters.order,
    limit: PAGE_SIZE + 1,               // one extra, to detect a next page
    offset: (page - 1) * PAGE_SIZE,
  };
}

interface Result {
  key: string;
  items: FeedItem[];
  hasNext: boolean;
  error: string | null;
}

export function useFeedItems(feedId: string, filters: ItemFilterValues, page: number) {
  const { query, from, to, sortBy, order } = filters;
  const key = JSON.stringify([feedId, query, from, to, sortBy, order, page]);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;
    getItems(feedId, buildParams({ query, from, to, sortBy, order }, page))
      .then((data) => {
        if (!cancelled) {
          setResult({
            key,
            items: data.slice(0, PAGE_SIZE),
            hasNext: data.length > PAGE_SIZE,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const error = err instanceof ApiError ? err.message : 'Something went wrong.';
          setResult({ key, items: [], hasNext: false, error });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, feedId, query, from, to, sortBy, order, page]);

  const current = result?.key === key ? result : null;
  return {
    items: current?.items ?? [],
    error: current?.error ?? null,
    hasNext: current?.hasNext ?? false,
    loading: current === null,
  };
}