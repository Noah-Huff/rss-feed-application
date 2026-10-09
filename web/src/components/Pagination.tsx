import "../styles/components/pagination.css";

interface PaginationProps {
  page: number;
  hasNext: boolean;
  disabled: boolean;
  onChange: (page: number) => void;
}

export function Pagination({ page, hasNext, disabled, onChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="pagination">
      <button onClick={() => onChange(page - 1)} disabled={disabled || page === 1}>
        Previous
      </button>
      <span>Page {page}</span>
      <button onClick={() => onChange(page + 1)} disabled={disabled || !hasNext}>
        Next
      </button>
    </nav>
  );
}