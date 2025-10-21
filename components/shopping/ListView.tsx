'use client';

import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/shared/Button';
import { SectionItem } from './SectionItem';
import type { EinkaufsItem, ShoppingSections } from '@/lib/shopping';
import { SHOPPING_SECTIONS, groupByCategory } from '@/lib/shopping';
import type { FilterKey } from '@/hooks/useShoppingList';

interface ListViewProps {
  items: EinkaufsItem[];
  filter: FilterKey;
  pendingCompleted: string[];
  onCheck: (item: EinkaufsItem) => void;
  onCancelPending: (id: string) => void;
  onDelete: (item: EinkaufsItem) => void;
  onBulkToggle: (ids: string[], erledigt: boolean) => void;
}

export function ListView({
  items,
  filter,
  pendingCompleted,
  onCheck,
  onCancelPending,
  onDelete,
  onBulkToggle
}: ListViewProps) {
  const [expandedOpen, setExpandedOpen] = useState<string[]>(SHOPPING_SECTIONS);
  const [expandedDone, setExpandedDone] = useState<string[]>([]);

  const groupedOpen = useMemo(() => groupByCategory(items.filter((item) => !item.erledigt)), [items]);
  const groupedDone = useMemo(() => groupByCategory(items.filter((item) => item.erledigt)), [items]);
  const groupedAll = useMemo(() => groupByCategory(items), [items]);

  const hasEntries = useMemo(() => Object.values(groupedAll).some((section) => section.length > 0), [groupedAll]);

  if (!hasEntries) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Noch keine Einträge.</p>
      </div>
    );
  }

  const renderGroups = (
    groups: Record<ShoppingSections, EinkaufsItem[]>,
    expanded: string[],
    onExpandedChange: (values: string[]) => void
  ) => (
    <Accordion type="multiple" value={expanded} onValueChange={(values) => onExpandedChange(values as string[])} className="space-y-3">
      {SHOPPING_SECTIONS.map((section) => {
        const sectionItems = groups[section];
        if (!sectionItems || sectionItems.length === 0) {
          return null;
        }

        const erledigteIds = sectionItems.filter((item) => item.erledigt).map((item) => item.id);
        const offeneIds = sectionItems.filter((item) => !item.erledigt).map((item) => item.id);

        return (
          <AccordionItem key={section} value={section} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <AccordionTrigger className="flex items-center justify-between px-4 py-3 text-left text-base font-semibold">
              <span>{section}</span>
              <span className="text-sm text-muted-foreground">{sectionItems.length} Artikel</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="flex flex-wrap items-center justify-end gap-2 pb-3">
                {offeneIds.length > 0 ? (
                  <Button type="button" size="sm" variant="secondary" onClick={() => onBulkToggle(offeneIds, true)}>
                    Alle abhaken
                  </Button>
                ) : null}
                {erledigteIds.length > 0 ? (
                  <Button type="button" size="sm" variant="secondary" onClick={() => onBulkToggle(erledigteIds, false)}>
                    Alle zurücksetzen
                  </Button>
                ) : null}
              </div>
              <ul className="space-y-2">
                {sectionItems.map((item, index) => (
          <SectionItem
            key={item.id}
                    section={section}
                    item={item}
                    index={index}
                    isPending={pendingCompleted.includes(item.id)}
                    onCheck={() => onCheck(item)}
                    onCancelPending={() => onCancelPending(item.id)}
                    onDelete={() => onDelete(item)}
                  />
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

  const hasOpen = Object.values(groupedOpen).some((section) => section.length > 0);
  const hasDone = Object.values(groupedDone).some((section) => section.length > 0);

  return (
    <section className="space-y-6">
      {filter === 'alle' ? (
        <>
          {hasOpen ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Offen</h3>
              {renderGroups(groupedOpen, expandedOpen, setExpandedOpen)}
            </div>
          ) : null}
          {hasDone ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Erledigt</h3>
              {renderGroups(groupedDone, expandedDone, setExpandedDone)}
            </div>
          ) : null}
        </>
      ) : (
        renderGroups(groupedAll, expandedOpen, setExpandedOpen)
      )}
    </section>
  );
}
