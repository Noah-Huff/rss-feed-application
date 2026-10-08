export function getRangeError(from: string, to: string): string | undefined {
  return from && to && from > to
    ? 'End date must be on or after the start date.'
    : undefined;
}