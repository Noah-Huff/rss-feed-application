import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeeds, deleteFeed } from '../api/feeds';
import { AddFeedForm } from '../components/AddFeedForm';
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

  function handleAdded(feed: Feed) {
    setFeeds((prev) =>
      prev.some((f) => f.id === feed.id) ? prev : [feed, ...prev]
    );
  }

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
      <h1>My feeds</h1>
      <AddFeedForm onAdded={handleAdded} />

      {loading && <p>Loading...</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {actionError && <p role="alert">{actionError}</p>}

      {!loading && !loadError && feeds.length === 0 && (
        <p>No feeds yet. Add one above.</p>
      )}

      <ul>
        {feeds.map((feed) => (
          <li key={feed.id}>
            <Link to={`/feeds/${feed.id}`}>{feed.title}</Link>
            <button onClick={() => handleDelete(feed.id)}>Unsubscribe</button>
          </li>
        ))}
      </ul>
    </main>
  );
}