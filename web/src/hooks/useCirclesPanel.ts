import { useEffect, useState, type KeyboardEvent } from 'react';

export function useCirclePanels<P extends string>() {
  const [open, setOpen] = useState<P | null>(null);

  useEffect(() => {
    if (open === null) return;

    function handlePointerDown(e: PointerEvent) {
      if (!(e.target as Element).closest('.filter-circle')) setOpen(null);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return {
    open,
    close: () => setOpen(null),
    show: (p: P) => open === null || open === p,
    toggle: (p: P) => setOpen(open === p ? null : p),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    },
  };
}