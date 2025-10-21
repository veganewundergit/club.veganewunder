export const SHOPPING_STORAGE_KEY = 'vw.shoppingList';

export type ShoppingSections = 'Obst & Gemüse' | 'Trockenware' | 'Kühlregal' | 'Tiefkühl' | 'Sonstiges';

export const SHOPPING_SECTIONS: ShoppingSections[] = ['Obst & Gemüse', 'Trockenware', 'Kühlregal', 'Tiefkühl', 'Sonstiges'];

export type ShoppingList = Partial<Record<ShoppingSections, string[]>>;

const LABEL_CANDIDATES = ['name', 'Name', 'label', 'Label', 'Zutat', 'Bezeichnung', 'value', 'Value', 'text', 'Text', 'title', 'Title'];

export function extractIngredientLabel(raw: unknown): string {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed && trimmed !== '[object Object]') {
      return trimmed;
    }
    return trimmed || 'Unbekannte Zutat';
  }

  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw);
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    for (const key of LABEL_CANDIDATES) {
      const candidate = record[key];
      if (typeof candidate === 'string') {
        const trimmed = candidate.trim();
        if (trimmed) {
          return trimmed;
        }
      }
    }

    const stringified = JSON.stringify(raw);
    if (stringified && stringified !== '{}') {
      return stringified;
    }
  }

  if (raw === null || raw === undefined) {
    return 'Unbekannte Zutat';
  }

  return String(raw);
}

export function normalizeFromApi(data: unknown): ShoppingList {
  if (!data || typeof data !== 'object') {
    return {};
  }

  return Object.entries(data as Record<string, unknown>).reduce<ShoppingList>((acc, [section, value]) => {
    if (!Array.isArray(value)) {
      return acc;
    }

    const normalized = value
      .map((item) => extractIngredientLabel(item))
      .map((item) => item.trim())
      .filter((item) => Boolean(item));

    if (normalized.length > 0 && isShoppingSection(section)) {
      acc[section] = normalized;
    }

    return acc;
  }, {});
}

export function isShoppingSection(section: string): section is ShoppingSections {
  return SHOPPING_SECTIONS.includes(section as ShoppingSections);
}

export function sanitizeShoppingList(list: ShoppingList): ShoppingList {
  return Object.entries(list ?? {}).reduce<ShoppingList>((acc, [section, items]) => {
    if (!Array.isArray(items) || !isShoppingSection(section)) {
      return acc;
    }

    const sanitized = items
      .map((item) => extractIngredientLabel(item))
      .map((item) => item.trim())
      .filter((item) => Boolean(item));

    if (sanitized.length > 0) {
      acc[section] = sanitized;
    }

    return acc;
  }, {});
}
