import { useEffect, useState, type SubmitEvent } from 'react';
import { emptyFilters, type ItemFilterValues } from '../hooks/useFeedItems';
import type { ItemSortBy, SortOrder } from '../models/feedModel';
import OrderIcon from "../assets/OrderIcon"
import SearchIcon from '../assets/SearchIcon';
import FilterIcon from '../assets/FilterIcon';
import "../styles/components/item-filters.css";
import CloseIcon from '../assets/CloseIcon';

interface ItemFiltersProps {
  onApply: (filters: ItemFilterValues) => void;
}

type Panel = 'search' | 'filter' | 'order';

const SORT_OPTIONS: { value: ItemSortBy; label: string }[] = [
  { value: 'publishedAt', label: 'Published date' },
  { value: 'title', label: 'Title' },
  { value: 'description', label: 'Description' },
];

const ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

interface OptionListProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onPick: (value: T) => void;
}

function OptionList<T extends string>({ options, value, onPick }: OptionListProps<T>) {
  return (
    <ul id="options" className="filter-options" role="listbox">
      {options.map((o) => (
        <li key={o.value}>
          <button
            type="button"
            role="option"
            aria-selected={o.value === value}
            className={o.value === value ? 'is-selected' : ''}
            onClick={() => onPick(o.value)}
          >
            {o.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ItemFilters({ onApply }: ItemFiltersProps) {
  const [draft, setDraft] = useState<ItemFilterValues>(emptyFilters);
  const [open, setOpen] = useState<Panel | null>(null);
  const [searchText, setSearchText] = useState('');

  function handleSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const updated = { ...draft, query: searchText };
    setDraft(updated);
    onApply(updated);
    setOpen(null);
  }

  function handleClearSearch() {
    setSearchText('');
    const updated = { ...draft, query: '' };
    setDraft(updated);
    onApply(updated);
    setOpen(null);
  }

  function pick(next: Partial<ItemFilterValues>) {
    const updated = { ...draft, ...next };
    setDraft(updated);
    onApply(updated);
    setOpen(null);
  }

  const show = (p: Panel) => open === null || open === p;
  const toggle = (p: Panel) => setOpen(open === p ? null : p);
  const cls = (p: Panel) => `filter-circle${open === p ? ' is-open' : ''}`;

  useEffect(() => {
    if (open === null) return;

    function handlePointerDown(e: PointerEvent) {
      if (!(e.target as Element).closest('.filter-circle')) {
        setOpen(null);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <div
      className="item-filters"
      onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
    >
      {show('search') && (
        <div className={cls('search')}>
          <button type="button" className="filter-circle__icon"
            aria-label="Search" onClick={() => toggle('search')}>
            <SearchIcon />
          </button>
          {open === 'search' && (
            <form className="filter-search" onSubmit={handleSearch}>
              <input
                autoFocus
                className="filter-input"
                placeholder="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button type="submit" className="filter-search__submit" aria-label="Run search">
                <SearchIcon />
              </button>
              <button
                type="button"
                className="filter-search__clear"
                aria-label="Clear search"
                onClick={handleClearSearch}
              >
                <CloseIcon />
              </button>
            </form>
          )}
        </div>
      )}

      {show('filter') && (
        <div className={cls('filter')}>
          <button type="button" className="filter-circle__icon"
            aria-label="Sort by" onClick={() => toggle('filter')}>
            <FilterIcon />
          </button>
          {open === 'filter' && (
            <OptionList
              options={SORT_OPTIONS}
              value={draft.sortBy}
              onPick={(sortBy) => pick({ sortBy })}
            />
          )}
        </div>
      )}

      {show('order') && (
        <div className={cls('order')}>
          <button type="button" className="filter-circle__icon"
            aria-label="Order" onClick={() => toggle('order')}>
            <OrderIcon />
          </button>
          {open === 'order' && (
            <OptionList
              options={ORDER_OPTIONS}
              value={draft.order}
              onPick={(order) => pick({ order })}
            />
          )}
        </div>
      )}
    </div>
  );
}