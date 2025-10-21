'use client';

import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/shared/Button';
import { SectionItem } from './SectionItem';
import type { ShoppingList, ShoppingSections } from '@/lib/shopping';
import { SHOPPING_SECTIONS, sanitizeShoppingList } from '@/lib/shopping';

interface CheckedMap {
  [key: string]: boolean;
}

interface ListViewProps {
  list: ShoppingList;
  checked: CheckedMap;
  onToggle: (section: ShoppingSections, item: string, value: boolean) => void;
  onBulk: (section: ShoppingSections, value: boolean) => void;
  onReset: () => void;
}

export function ListView({ list, checked, onToggle, onBulk, onReset }: ListViewProps) {
  const [expanded, setExpanded] = useState<string[]>(SHOPPING_SECTIONS);

  const normalized = useMemo(() => sanitizeShoppingList(list), [list]);

  const sectionCounts = useMemo(
    () =>
      SHOPPING_SECTIONS.reduce<Record<string, number>>((acc, section) => {
        acc[section] = normalized[section]?.length ?? 0;
        return acc;
      }, {}),
    [normalized]
  );

  if (!normalized || typeof normalized !== 'object' || Object.keys(normalized).length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Noch keine Einträge.</p>
      </div>
    );
  }

  function handleExpandAll(value: boolean) {
    setExpanded(value ? [...SHOPPING_SECTIONS] : []);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={() => handleExpandAll(true)}>
          Sektionen einblenden
        </Button>
        <Button type="button" variant="secondary" onClick={() => handleExpandAll(false)}>
          Sektionen ausblenden
        </Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          Alle zurücksetzen
        </Button>
      </div>

      <Accordion type="multiple" value={expanded} onValueChange={(values) => setExpanded(values as string[])} className="space-y-3">
        {SHOPPING_SECTIONS.map((section) => {
          const items = normalized[section];
          if (!items || items.length === 0) {
            return null;
          }

          return (
            <AccordionItem key={section} value={section} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <AccordionTrigger className="flex items-center justify-between px-4 py-3 text-left text-base font-semibold">
                <span>{section}</span>
                <span className="text-sm text-muted-foreground">{sectionCounts[section]} Artikel</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="flex items-center justify-end gap-2 pb-3">
                  <Button type="button" size="sm" variant="secondary" onClick={() => onBulk(section, true)}>
                    Alle abhaken
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => onBulk(section, false)}>
                    Alle zurücksetzen
                  </Button>
                </div>
                <ul className="space-y-2">
                  {items.map((item, index) => {
                    const key = `${section}::${item}`;
                    const isChecked = checked[key] ?? false;
                    return (
                      <SectionItem
                        key={key}
                        section={section}
                        label={item}
                        checked={isChecked}
                        index={index}
                        onChange={(value) => onToggle(section, item, value)}
                      />
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
