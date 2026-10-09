import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFeedItems, emptyFilters, type ItemFilterValues } from '../hooks/useFeedItems';
import { ItemCard } from '../components/ItemCard';
import { ItemFilters } from '../components/ItemFilters';
import "../styles/pages/feeds.css";
import { Pagination } from '../components/Pagination';

export default function FeedItemsPage() {
  const { id } = useParams<{ id: string }>();
  const [filters, setFilters] = useState<ItemFilterValues>(emptyFilters);
  const [page, setPage] = useState(1);
  const { items, loading, error, hasNext } = useFeedItems(id!, filters, page);
  const filtered = filters.query || filters.from || filters.to;

  function handleApply(next: ItemFilterValues) {
    setFilters(next);
    setPage(1);               // a new search or sort starts at page one
  }

  function handlePageChange(next: number) {
    setPage(next);
    window.scrollTo({ top: 0 });
  }

  return (
    <main className="feeds">
      <Link to="/feeds">← Back to feeds</Link>
      <h1>Items</h1>
      <ItemFilters onApply={handleApply} />

      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p>{filtered ? 'No items match your filters.' : 'No items yet.'}</p>
      )}

      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}

      {!error && (items.length > 0 || page > 1) && (
        <Pagination page={page} hasNext={hasNext} disabled={loading} onChange={handlePageChange} />
      )}
    </main>
  );
}