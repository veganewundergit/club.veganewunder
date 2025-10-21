export const SHOPPING_STORAGE_KEY = 'vw.smartList';

export type ShoppingSections = 'Obst & Gemüse' | 'Kühlregal' | 'Trockenware' | 'Tiefkühl' | 'Sonstiges';

export const SHOPPING_SECTIONS: ShoppingSections[] = ['Obst & Gemüse', 'Kühlregal', 'Trockenware', 'Tiefkühl', 'Sonstiges'];

export type EinkaufsItem = {
  id: string;
  name: string;
  kategorie: ShoppingSections;
  erledigt: boolean;
  vorhanden: boolean;
  tags?: string[];
};

const DICTIONARY: Record<ShoppingSections, string[]> = {
  'Obst & Gemüse': ['karotte', 'kartoffel', 'zwiebel', 'knoblauch', 'tomate', 'paprika', 'gurke', 'apfel', 'banane', 'spinat', 'traube', 'beere'],
  Kühlregal: ['tofu', 'hafermilch', 'sojasoße', 'joghurt', 'butter'],
  Trockenware: ['reis', 'nudeln', 'linsen', 'bohnen', 'mehl', 'haferflocken'],
  Tiefkühl: ['tiefkühl', 'frost', 'eis'],
  Sonstiges: []
};

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
        if (trimmed) return trimmed;
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

export function isShoppingSection(section: string): section is ShoppingSections {
  return SHOPPING_SECTIONS.includes(section as ShoppingSections);
}

export function normalizeFromApi(data: unknown): EinkaufsItem[] {
  if (!data || typeof data !== 'object') {
    return [];
  }

  const seen = new Map<string, EinkaufsItem>();

  for (const [section, values] of Object.entries(data as Record<string, unknown>)) {
    if (!isShoppingSection(section) || !Array.isArray(values)) continue;

    for (const entry of values) {
      const label = extractIngredientLabel(entry);
      if (!label) continue;
      const key = label.toLowerCase();
      if (seen.has(key)) continue;

      seen.set(key, {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        name: label,
        kategorie: section,
        erledigt: false,
        vorhanden: false
      });
    }
  }

  const items = Array.from(seen.values());
  return sortItems(items);
}

export function sortItems(items: EinkaufsItem[]): EinkaufsItem[] {
  return [...items].sort((a, b) => {
    const catDiff = SHOPPING_SECTIONS.indexOf(a.kategorie) - SHOPPING_SECTIONS.indexOf(b.kategorie);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });
  });
}

export function groupByCategory(items: EinkaufsItem[]): Record<ShoppingSections, EinkaufsItem[]> {
  return SHOPPING_SECTIONS.reduce<Record<ShoppingSections, EinkaufsItem[]>>((acc, section) => {
    acc[section] = items.filter((item) => item.kategorie === section);
    return acc;
  }, {
    'Obst & Gemüse': [],
    Kühlregal: [],
    Trockenware: [],
    Tiefkühl: [],
    Sonstiges: []
  });
}

export function autoKategorie(name: string): ShoppingSections {
  const lower = name.toLowerCase();
  for (const section of SHOPPING_SECTIONS) {
    const keywords = DICTIONARY[section];
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return section;
    }
  }
  return 'Sonstiges';
}
