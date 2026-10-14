import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeeds, deleteFeed } from '../api/feeds';
import { ApiError } from '../models/errors';
import type { Feed } from '../models/feedModel';
import "../styles/pages/feeds.css";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong.';
}

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFeeds()
      .then((data) => {
        if (!cancelled) setFeeds(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await deleteFeed(id);
      setFeeds((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <main className="feeds">

      {loading && <p>Loading...</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {actionError && <p role="alert">{actionError}</p>}

      {!loading && !loadError && feeds.length === 0 && (
        <p>No feeds yet.</p>
      )}

      <ul>
        {feeds.map((feed) => (
          <li key={feed.id}>
            <div>
              <Link to={`/feeds/${feed.id}`}>{feed.title}</Link>
              <div><small>{feed.url}</small></div>
            </div>
            <button onClick={() => handleDelete(feed.id)}>Unsubscribe</button>
          </li>
        ))}
      </ul>
    </main>
  );
}