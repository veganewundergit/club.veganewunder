'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ShoppingList, ShoppingSections } from '@/lib/shopping';
import { SHOPPING_STORAGE_KEY, sanitizeShoppingList, normalizeFromApi, extractIngredientLabel } from '@/lib/shopping';

type CheckedMap = Record<string, boolean>;

export interface UseShoppingListResult {
  list: ShoppingList;
  checked: CheckedMap;
  setList: (next: ShoppingList) => void;
  reset: () => void;
  setChecked: (section: ShoppingSections, item: string, value: boolean) => void;
  bulkCheck: (section: ShoppingSections, value: boolean) => void;
  saveLocal: () => void;
  loadLocal: () => void;
  normalizeFromApi: (data: unknown) => ShoppingList;
}

function buildKey(section: string, item: string) {
  return `${section}::${item}`;
}

export function useShoppingList(): UseShoppingListResult {
  const [list, setListState] = useState<ShoppingList>({});
  const [checked, setCheckedMap] = useState<CheckedMap>({});

  const setList = useCallback((next: ShoppingList) => {
    const sanitized = sanitizeShoppingList(next);
    setListState(sanitized);

    setCheckedMap((prev) => {
      const updated: CheckedMap = {};
      Object.entries(sanitized).forEach(([section, items]) => {
        items?.forEach((item) => {
          const key = buildKey(section, extractIngredientLabel(item));
          updated[key] = prev[key] ?? false;
        });
      });
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    setListState({});
    setCheckedMap({});
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SHOPPING_STORAGE_KEY);
    }
  }, []);

  const setChecked = useCallback((section: ShoppingSections, item: string, value: boolean) => {
    const key = buildKey(section, item);
    setCheckedMap((prev) => ({ ...prev, [key]: value }));
  }, []);

  const bulkCheck = useCallback((section: ShoppingSections, value: boolean) => {
    setCheckedMap((prev) => {
      const next = { ...prev };
      const items = list[section] ?? [];
      items.forEach((item) => {
        const key = buildKey(section, item);
        next[key] = value;
      });
      return next;
    });
  }, [list]);

  const saveLocal = useCallback(() => {
    if (typeof window === 'undefined') return;
    const payload = { list, checked };
    window.localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(payload));
  }, [checked, list]);

  const loadLocal = useCallback(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(SHOPPING_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as { list?: ShoppingList; checked?: CheckedMap };
      if (parsed.list) {
        setList(parsed.list);
      }
      if (parsed.checked) {
        setCheckedMap(parsed.checked);
      }
    } catch (error) {
      console.error('Konnte Einkaufsliste nicht laden', error);
    }
  }, [setList]);

  useEffect(() => {
    loadLocal();
  }, [loadLocal]);

  const apiNormalizer = useCallback((data: unknown) => normalizeFromApi(data), []);

  const value = useMemo<UseShoppingListResult>(() => ({
    list,
    checked,
    setList,
    reset,
    setChecked,
    bulkCheck,
    saveLocal,
    loadLocal,
    normalizeFromApi: apiNormalizer
  }), [apiNormalizer, bulkCheck, checked, list, loadLocal, reset, saveLocal, setChecked, setList]);

  return value;
}
