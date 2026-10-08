import { useState, type FormEvent } from 'react';
import { FormField } from './FormField'; // confirm path
import { emptyFilters, type ItemFilterValues } from '../hooks/useFeedItems';

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

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Search"
        name="query"
        value={draft.query}
        onChange={(e) => setDraft((prev) => ({ ...prev, query: e.target.value }))}
      />
      <button type="submit">Apply</button>
      <button type="button" onClick={handleClear}>Clear</button>
    </form>
  );
}