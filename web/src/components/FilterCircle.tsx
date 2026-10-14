import type { ReactNode } from 'react';

interface FilterCircleProps {
  label: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children?: ReactNode;   // the panel, rendered only while open
}

export default function FilterCircle({ label, icon, isOpen, onToggle, children }: FilterCircleProps) {
  return (
    <div className={`filter-circle${isOpen ? ' is-open' : ''}`}>
      <button type="button" className="filter-circle__icon" aria-label={label} onClick={onToggle}>
        {icon}
      </button>
      {isOpen && children}
    </div>
  );
}