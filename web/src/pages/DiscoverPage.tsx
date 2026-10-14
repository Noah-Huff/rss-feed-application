import { useEffect, useState } from 'react';
import { Pagination } from '../components/Pagination';
import { addFeed, discoverFeeds, type DiscoverFilters } from '../api/feeds';
import { ApiError } from '../models/errors';
import type { Feed } from '../models/feedModel';
import "../styles/pages/dashboard.css";
import "../styles/pages/feeds.css";
import { DiscoverControls } from '../components/DiscoverControl';

const PAGE_SIZE = 10;

function errorMessage(err: unknown): string {
    return err instanceof ApiError ? err.message : 'Something went wrong.';
}

interface Result {
    key: string;
    feeds: Feed[];
    hasNext: boolean;
    error: string | null;
}

export default function DiscoverPage() {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [reloads, setReloads] = useState(0);
    const [result, setResult] = useState<Result | null>(null);
    const [subscribingId, setSubscribingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const key = JSON.stringify([query, page, reloads]);

    useEffect(() => {
        let cancelled = false;
        const filters: DiscoverFilters = {
            query: query || undefined,
            limit: PAGE_SIZE + 1,
            offset: (page - 1) * PAGE_SIZE,
        };
        discoverFeeds(filters)
            .then((data) => {
                if (!cancelled) {
                    setResult({
                        key,
                        feeds: data.slice(0, PAGE_SIZE),
                        hasNext: data.length > PAGE_SIZE,
                        error: null,
                    });
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setResult({ key, feeds: [], hasNext: false, error: errorMessage(err) });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [key, query, page]);

    const current = result?.key === key ? result : null;
    const loading = current === null;
    const feeds = current?.feeds ?? [];

    function handlePageChange(next: number) {
        setActionError(null);
        setPage(next);
        window.scrollTo({ top: 0 });
    }

    async function handleSubscribe(feed: Feed) {
        setActionError(null);
        setSubscribingId(feed.id);
        try {
            await addFeed(feed.url);
            if (feeds.length === 1 && page > 1) setPage(page - 1);
            setReloads((n) => n + 1);
        } catch (err) {
            setActionError(errorMessage(err));
        } finally {
            setSubscribingId(null);
        }
    }

    return <div className="discover dashboard">
        <div className="feeds">
            <h2>Enter a new feed, or see what others are reading!</h2>
            <DiscoverControls
                onSearch={(q) => {
                    setActionError(null);
                    setQuery(q);
                    setPage(1);
                }}
                onAdded={() => setReloads((n) => n + 1)}
            />

            {loading && <p>Loading...</p>}
            {current?.error && <p role="alert">{current.error}</p>}
            {actionError && <p role="alert">{actionError}</p>}

            {!loading && !current?.error && feeds.length === 0 && (
                <p>{query ? 'No feeds match your search.' : 'No more feeds to discover.'}</p>
            )}

            <ul>
                {feeds.map((feed) => (
                    <li key={feed.id}>
                        <div>
                            <span>{feed.title}</span>
                            <div>
                                <small>{feed.url}</small>
                            </div>
                        </div>
                        <button
                            onClick={() => handleSubscribe(feed)}
                            disabled={subscribingId === feed.id}
                        >
                            {subscribingId === feed.id ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </li>
                ))}
            </ul>

            {!current?.error && (feeds.length > 0 || page > 1) && (
                <Pagination page={page} hasNext={current?.hasNext ?? false} disabled={loading} onChange={handlePageChange} />
            )}
        </div>
    </div>
}