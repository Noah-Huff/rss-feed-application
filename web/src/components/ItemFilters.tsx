import { useState, type SubmitEvent } from 'react';
import { emptyFilters, type ItemFilterValues } from '../hooks/useFeedItems';
import type { ItemSortBy, SortOrder } from '../models/feedModel';
import FilterCircle from './FilterCircle';
import OrderIcon from "../assets/OrderIcon"
import SearchIcon from '../assets/SearchIcon';
import FilterIcon from '../assets/FilterIcon';
import CloseIcon from '../assets/CloseIcon';
import "../styles/components/item-filters.css";
import { useCirclePanels } from '../hooks/useCirclesPanel';

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
  const [searchText, setSearchText] = useState('');
  const panels = useCirclePanels<Panel>();

  function handleSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const updated = { ...draft, query: searchText };
    setDraft(updated);
    onApply(updated);
    panels.close();
  }

  function handleClearSearch() {
    setSearchText('');
    const updated = { ...draft, query: '' };
    setDraft(updated);
    onApply(updated);
    panels.close();
  }

  function pick(next: Partial<ItemFilterValues>) {
    const updated = { ...draft, ...next };
    setDraft(updated);
    onApply(updated);
    panels.close();
  }

  return (
    <div className="item-filters" onKeyDown={panels.onKeyDown}>
      {panels.show('search') && (
        <FilterCircle
          label="Search"
          icon={<SearchIcon />}
          isOpen={panels.open === 'search'}
          onToggle={() => panels.toggle('search')}
        >
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
        </FilterCircle>
      )}

      {panels.show('filter') && (
        <FilterCircle
          label="Sort by"
          icon={<FilterIcon />}
          isOpen={panels.open === 'filter'}
          onToggle={() => panels.toggle('filter')}
        >
          <OptionList
            options={SORT_OPTIONS}
            value={draft.sortBy}
            onPick={(sortBy) => pick({ sortBy })}
          />
        </FilterCircle>
      )}

      {panels.show('order') && (
        <FilterCircle
          label="Order"
          icon={<OrderIcon />}
          isOpen={panels.open === 'order'}
          onToggle={() => panels.toggle('order')}
        >
          <OptionList
            options={ORDER_OPTIONS}
            value={draft.order}
            onPick={(order) => pick({ order })}
          />
        </FilterCircle>
      )}
    </div>
  );
}