import { useState, type FormEvent } from 'react';
import { FormField } from './FormField'; // confirm path
import { emptyFilters, type ItemFilterValues } from '../hooks/useFeedItems';
import type { ItemSortBy, SortOrder } from '../models/feedModel';
import "../styles/components/item-filters.css";

interface ItemFiltersProps {
  onApply: (filters: ItemFilterValues) => void;
}

export function ItemFilters({ onApply }: ItemFiltersProps) {
  const [draft, setDraft] = useState<ItemFilterValues>(emptyFilters);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onApply(draft);
  }

  function handleClear() {
    setDraft(emptyFilters);
    onApply(emptyFilters);
  }

  function changeSort(next: Partial<ItemFilterValues>) {
    const updated = { ...draft, ...next };
    setDraft(updated);
    onApply(updated);   // sort applies immediately, no Apply click
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Search"
        name="query"
        value={draft.query}
        onChange={(e) => setDraft((prev) => ({ ...prev, query: e.target.value }))}
      />
      <div className="item-filters">
        <label htmlFor="sortBy">Sort by</label>
        <select
          id="sortBy"
          value={draft.sortBy}
          onChange={(e) => changeSort({ sortBy: e.target.value as ItemSortBy })}
        >
          <option value="publishedAt">Published date</option>
          <option value="title">Title</option>
          <option value="description">Description</option>
        </select>

        <label htmlFor="order">Order</label>
        <select
          id="order"
          value={draft.order}
          onChange={(e) => changeSort({ order: e.target.value as SortOrder })}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        <button type="submit">Apply</button>
        <button type="button" onClick={handleClear}>Clear</button>
      </div>
    </form>
  );
}