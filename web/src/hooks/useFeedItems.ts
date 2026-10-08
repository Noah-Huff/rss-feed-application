import { useEffect, useState } from 'react';
import { getItems, type GetItemsParams } from '../api/feeds';
import { ApiError } from '../models/errors';
import type { FeedItem } from '../models/feedModel'; 

const PAGE_SIZE = import.meta.env.VITE_FEED_PAGE_SIZE | 20;

export interface ItemFilterValues {
  query: string;
  from: string; 
  to: string;
}

export const emptyFilters: ItemFilterValues = { query: '', from: '', to: '' };

function toIso(date: string, endOfDay: boolean): string {
  if (!date) return '';
  const time = endOfDay ? 'T23:59:59.999' : 'T00:00:00';
  return new Date(`${date}${time}`).toISOString();
}

function buildParams(filters: ItemFilterValues, offset: number): GetItemsParams {
  return {
    query: filters.query,
    from: toIso(filters.from, false),
    to: toIso(filters.to, true),
    limit: PAGE_SIZE,
    offset,
  };
}

function messageFrom(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong.';
}

interface Result {
  key: string;
  items: FeedItem[];
  error: string | null;
  moreError: string | null;
  done: boolean;
}

export function useFeedItems(feedId: string, filters: ItemFilterValues) {
  const { query, from, to } = filters;
  const key = JSON.stringify([feedId, query, from, to]);
  const [result, setResult] = useState<Result | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getItems(feedId, buildParams({ query, from, to }, 0))
      .then((items) => {
        if (!cancelled) {
          setResult({ key, items, error: null, moreError: null, done: items.length < PAGE_SIZE });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key, items: [], error: messageFrom(err), moreError: null, done: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, feedId, query, from, to]);

  const current = result?.key === key ? result : null;

  async function loadMore() {
    if (!current || current.done || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await getItems(feedId, buildParams(filters, current.items.length));
      setResult((prev) =>
        prev && prev.key === key
          ? { ...prev, items: [...prev.items, ...next], moreError: null, done: next.length < PAGE_SIZE }
          : prev
      );
    } catch (err) {
      setResult((prev) =>
        prev && prev.key === key ? { ...prev, moreError: messageFrom(err) } : prev
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return {
    items: current?.items ?? [],
    error: current?.error ?? null,
    moreError: current?.moreError ?? null,
    loading: current === null,
    loadingMore,
    hasMore: current !== null && !current.done,
    loadMore,
  };
}