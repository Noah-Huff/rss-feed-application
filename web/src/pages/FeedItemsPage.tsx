import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFeedItems, emptyFilters, type ItemFilterValues } from '../hooks/useFeedItems';
import { ItemCard } from '../components/ItemCard';
import { ItemFilters } from '../components/ItemFilters';

export default function FeedItemsPage() {
  const { id } = useParams<{ id: string }>();
  const [filters, setFilters] = useState<ItemFilterValues>(emptyFilters);
  const { items, loading, error } = useFeedItems(id!, filters);

  const filtered = filters.query || filters.from || filters.to;

  return (
    <main>
      <Link to="/feeds">← Back to feeds</Link>
      <h1>Items</h1>
      <ItemFilters onApply={setFilters} />

      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p>{filtered ? 'No items match your filters.' : 'No items yet.'}</p>
      )}

      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </main>
  );
}