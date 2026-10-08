import { getRangeError } from '../utils/dateUtils';
import { FormField } from './FormField'; // confirm path

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangeFilter({ from, to, onFromChange, onToChange }: DateRangeFilterProps) {
  return (
    <>
      <FormField
        label="From"
        name="from"
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
      />
      <FormField
        label="To"
        name="to"
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        error={getRangeError(from, to)}
      />
    </>
  );
}