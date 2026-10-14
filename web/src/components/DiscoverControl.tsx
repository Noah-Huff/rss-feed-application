import { useState, type SubmitEvent } from 'react';
import { AddFeedForm } from './AddFeedForm';
import FilterCircle from './FilterCircle';
import SearchIcon from '../assets/SearchIcon';
import CloseIcon from '../assets/CloseIcon';
import "../styles/components/item-filters.css";
import { useCirclePanels } from '../hooks/useCirclesPanel';
import PlusIcon from '../assets/PlusIcon';

type Panel = 'search' | 'add';

interface DiscoverControlsProps {
    onSearch: (query: string) => void;
    onAdded: () => void;
}

export function DiscoverControls({ onSearch, onAdded }: DiscoverControlsProps) {
    const panels = useCirclePanels<Panel>();
    const [searchText, setSearchText] = useState('');

    function handleSearch(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        onSearch(searchText.trim());
        panels.close();
    }

    function handleClear() {
        setSearchText('');
        onSearch('');
        panels.close();
    }

    return (
        <div className="item-filters" onKeyDown={panels.onKeyDown}>
            {panels.show('search') && (
                <FilterCircle
                    label="Search feeds"
                    icon={<SearchIcon />}
                    isOpen={panels.open === 'search'}
                    onToggle={() => panels.toggle('search')}
                >
                    <form className="filter-search" onSubmit={handleSearch}>
                        <input
                            autoFocus
                            className="filter-input"
                            placeholder="Search feeds"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button type="submit" className="filter-search__submit" aria-label="Run search">
                            <SearchIcon />
                        </button>
                        <button type="button" className="filter-search__clear" aria-label="Clear search" onClick={handleClear}>
                            <CloseIcon />
                        </button>
                    </form>
                </FilterCircle>
            )}

            {panels.show('add') && (
                <FilterCircle
                    label="Add feed by URL"
                    icon={<PlusIcon/>}
                    isOpen={panels.open === 'add'}
                    onToggle={() => panels.toggle('add')}
                >
                    <AddFeedForm
                        compact
                        onAdded={() => {
                            onAdded();
                            panels.close();
                        }}
                    />
                </FilterCircle>
            )}
        </div>
    );
}