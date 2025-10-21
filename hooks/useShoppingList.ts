'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SHOPPING_STORAGE_KEY, SHOPPING_SECTIONS, normalizeFromApi, sortItems, autoKategorie, type EinkaufsItem } from '@/lib/shopping';

export type FilterKey = 'alle' | 'offen' | 'erledigt';

interface PersistedState {
  items: EinkaufsItem[];
}

interface UseShoppingListResult {
  items: EinkaufsItem[];
  filter: FilterKey;
  visibleItems: EinkaufsItem[];
  setFilter: (filter: FilterKey) => void;
  addManualItem: (name: string) => void;
  replaceWithApiData: (data: unknown) => void;
  setErledigt: (id: string, erledigt: boolean) => void;
  removeItem: (id: string) => void;
  restoreItem: (item: EinkaufsItem) => void;
  reset: () => void;
  resetChecks: () => void;
  markAll: (ids: string[], erledigt: boolean) => void;
}

function applyFilter(items: EinkaufsItem[], filter: FilterKey) {
  switch (filter) {
    case 'offen':
      return items.filter((item) => !item.erledigt);
    case 'erledigt':
      return items.filter((item) => item.erledigt);
    default:
      return items;
  }
}

export function useShoppingList(): UseShoppingListResult {
  const [items, setItems] = useState<EinkaufsItem[]>([]);
  const [filter, setFilter] = useState<FilterKey>('alle');
  const persistTimeout = useRef<number | null>(null);

  const schedulePersist = useCallback((next: EinkaufsItem[]) => {
    if (typeof window === 'undefined') return;
    if (persistTimeout.current) {
      window.clearTimeout(persistTimeout.current);
    }
    persistTimeout.current = window.setTimeout(() => {
      const payload: PersistedState = { items: next };
      window.localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(payload));
      persistTimeout.current = null;
    }, 250);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(SHOPPING_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as PersistedState;
      if (Array.isArray(parsed.items)) {
        const sorted = sortItems(parsed.items.map((item) => ({ ...item, erledigt: Boolean(item.erledigt), vorhanden: Boolean(item.vorhanden) })));
        setItems(sorted);
      }
    } catch (error) {
      console.error('Konnte Einkaufsliste nicht laden', error);
    }
  }, []);

  useEffect(() => {
    schedulePersist(items);
  }, [items, schedulePersist]);

  const replaceWithApiData = useCallback((data: unknown) => {
    const normalized = normalizeFromApi(data);
    setItems(normalized);
  }, []);

  const addManualItem = useCallback((rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    const normalized = name.charAt(0).toUpperCase() + name.slice(1);
    setItems((prev) => {
      if (prev.some((item) => item.name.toLowerCase() === normalized.toLowerCase())) {
        return prev;
      }

      const nextItem: EinkaufsItem = {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        name: normalized,
        kategorie: autoKategorie(normalized),
        erledigt: false,
        vorhanden: false
      };

      return sortItems([...prev, nextItem]);
    });
  }, []);

  const setErledigt = useCallback((id: string, erledigt: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, erledigt } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const restoreItem = useCallback((item: EinkaufsItem) => {
    setItems((prev) => sortItems([...prev, item]));
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SHOPPING_STORAGE_KEY);
    }
  }, []);

  const markAll = useCallback((ids: string[], erledigt: boolean) => {
    setItems((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, erledigt } : item)));
  }, []);

  const resetChecks = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, erledigt: false })));
  }, []);

  const visibleItems = useMemo(() => {
    const base = applyFilter(items, filter);
    const erledigtItems = base.filter((item) => item.erledigt);
    const offeneItems = base.filter((item) => !item.erledigt);
    return [...offeneItems, ...erledigtItems];
  }, [filter, items]);

  return {
    items,
    filter,
    visibleItems,
    setFilter,
    replaceWithApiData,
    addManualItem,
    setErledigt,
    removeItem,
    restoreItem,
    reset,
    resetChecks,
    markAll
  };
}
