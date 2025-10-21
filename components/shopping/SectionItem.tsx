'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { useRef } from 'react';
import type { EinkaufsItem, ShoppingSections } from '@/lib/shopping';

interface SectionItemProps {
  section: ShoppingSections;
  item: EinkaufsItem;
  index: number;
  isPending: boolean;
  onCheck: () => void;
  onCancelPending: () => void;
  onDelete: () => void;
}

export function SectionItem({
  section,
  item,
  index,
  isPending,
  onCheck,
  onCancelPending,
  onDelete
}: SectionItemProps) {
  const id = `section-${section}-${index}`;
  const longPressRef = useRef<number>();

  function startLongPress() {
    if (!isPending) return;
    clearLongPress();
    longPressRef.current = window.setTimeout(() => {
      onCancelPending();
      clearLongPress();
    }, 600);
  }

  function clearLongPress() {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = undefined;
    }
  }

  const baseClasses = [
    'flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2 transition-all duration-500 ease-in-out',
    isPending ? 'opacity-60' : 'opacity-100',
    !isPending && item.erledigt ? 'text-muted-foreground' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      className={baseClasses}
      onMouseDown={startLongPress}
      onMouseUp={clearLongPress}
      onMouseLeave={clearLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={clearLongPress}
      onTouchMove={clearLongPress}
    >
      <Checkbox
        aria-label={item.erledigt ? 'Als offen markieren' : 'Als erledigt markieren'}
        checked={item.erledigt || isPending}
        onClick={onCheck}
        className={isPending ? 'scale-90 opacity-75' : ''}
      />
      <div className="flex flex-1 items-center gap-3">
        <label htmlFor={id} className={`flex-1 text-sm transition ${item.erledigt && !isPending ? 'text-muted-foreground line-through' : ''}`}>
          {item.name}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="rounded-full border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
          aria-label="Eintrag löschen"
        >
          Entfernen
        </button>
      </div>
    </li>
  );
}
