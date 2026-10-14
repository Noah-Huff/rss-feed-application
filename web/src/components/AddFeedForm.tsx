import { useState, type ChangeEvent, type FormEvent } from 'react';
import { addFeed } from '../api/feeds';
import { FormField } from './FormField'; // ← confirm path and named export
import { ApiError } from '../models/errors';
import type { Feed } from '../models/feedModel';
import PlusIcon from '../assets/PlusIcon';

interface AddFeedFormProps {
  onAdded: (feed: Feed) => void;
  compact?: boolean;
}

export function AddFeedForm({ onAdded, compact = false}: AddFeedFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      const feed = await addFeed(url.trim());
      onAdded(feed);
      setUrl('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (compact) {
    return (
      <form className="filter-search" onSubmit={handleSubmit}>
        <input
          autoFocus
          className="filter-input"
          type="url"
          placeholder="https://example.com/rss.xml"
          aria-label="Feed URL"
          aria-invalid={!!error}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="filter-search__submit"
          aria-label="Add feed"
          disabled={submitting || !url.trim()}
        >
          <PlusIcon />
        </button>
        {error && <p role="alert" className="filter-error">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div id="add-feed">
        <FormField
          label="Enter Feed URL"
          name="url"
          type="url"
          value={url}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
          error={error}
          autoComplete="url"
        />
      </div>
      <button type="submit" disabled={submitting || !url.trim()}>
        {submitting ? 'Adding...' : 'Add feed'}
      </button>
    </form>
  );
}