import { useState } from 'react';
import { useFeedItems, emptyFilters, type ItemFilterValues } from '../hooks/useFeedItems';
import { ItemCard } from './ItemCard';
import { ItemFilters } from './ItemFilters';
import { Pagination } from './Pagination';
import "../styles/components/item-list.css";

interface ItemListProps {
    feedId?: string;   // omit for items from all subscribed feeds
}

export function ItemList({ feedId }: ItemListProps) {
    const [filters, setFilters] = useState<ItemFilterValues>(emptyFilters);
    const [page, setPage] = useState(1);
    const { items, loading, error, hasNext } = useFeedItems(feedId, filters, page);
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
        <section className="item-list">
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
        </section>
    );
}