'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { UploadCard } from '@/components/shopping/UploadCard';
import { ListView } from '@/components/shopping/ListView';
import { useShoppingList } from '@/hooks/useShoppingList';
import { Button } from '@/components/shared/Button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { SHOPPING_SECTIONS } from '@/lib/shopping';
import type { EinkaufsItem } from '@/lib/shopping';

type Step = 1 | 2 | 3;
type FilterKey = 'alle' | 'offen' | 'erledigt';

const FILTER_LABELS: Record<FilterKey, string> = {
  alle: 'Alle',
  offen: 'Offen',
  erledigt: 'Erledigt'
};

const COMPLETION_DELAY = 1800;
const vorschlaege = [
  'Karotte',
  'Kartoffel',
  'Zwiebel',
  'Knoblauch',
  'Tofu',
  'Tomate',
  'Paprika',
  'Gurke',
  'Apfel',
  'Banane',
  'Spinat',
  'Reis',
  'Nudeln',
  'Linsen',
  'Bohnen',
  'Hafermilch',
  'Sojasoße'
];

export default function EinkaufslistePage() {
  const {
    items,
    visibleItems,
    filter,
    setFilter,
    replaceWithApiData,
    addManualItem,
    setErledigt,
    removeItem,
    restoreItem,
    markAll,
    reset,
    resetChecks
  } = useShoppingList();
  const { addToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [pendingCompleted, setPendingCompleted] = useState<string[]>([]);
  const [recentlyRemoved, setRecentlyRemoved] = useState<EinkaufsItem[]>([]);
  const pendingTimers = useRef<Record<string, number>>({});
  const [inputValue, setInputValue] = useState('');
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    return () => {
      Object.values(pendingTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const hasItems = items.length > 0;

  const currentStep: Step = useMemo(() => {
    if (isExtracting) return 2;
    if (hasItems) return 3;
    if (file) return 2;
    return 1;
  }, [file, hasItems, isExtracting]);

  const totalItems = items.length;
  const erledigteItems = items.filter((item) => item.erledigt).length;

  async function handleExtract() {
    if (!file) {
      setApiError('Bitte wähle ein Bild aus.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsExtracting(true);
    setApiError(null);

    try {
      const response = await fetch('/api/generate-list', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: 'Konnte keine Zutaten extrahieren. Bitte anderes Bild probieren.' }));
        throw new Error(error ?? 'Konnte keine Zutaten extrahieren. Bitte anderes Bild probieren.');
      }

      const payload = await response.json();
      setPendingCompleted([]);
      Object.values(pendingTimers.current).forEach((timer) => window.clearTimeout(timer));
      pendingTimers.current = {};
      replaceWithApiData(payload);

      addToast({
        title: 'Intelligente Liste aktualisiert',
        description: 'Zutaten wurden sortiert und gruppiert.',
        variant: 'success'
      });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Konnte keine Zutaten extrahieren. Bitte anderes Bild probieren.';
      setApiError(message);
      addToast({
        title: 'Analyse fehlgeschlagen',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsExtracting(false);
    }
  }

function handleFileSelect(next: File | null) {
  setFile(next);
  setApiError(null);
  if (!next) {
    reset();
    setPendingCompleted([]);
    Object.values(pendingTimers.current).forEach((timer) => window.clearTimeout(timer));
    pendingTimers.current = {};
    setRecentlyRemoved([]);
  }
}

  function handleCheck(item: EinkaufsItem) {
    const isPending = pendingCompleted.includes(item.id);

    if (item.erledigt) {
      setErledigt(item.id, false);
      return;
    }

    if (isPending) {
      cancelPending(item.id, { revert: true });
      return;
    }

    setPendingCompleted((prev) => [...prev, item.id]);
    const timer = window.setTimeout(() => {
      setErledigt(item.id, true);
      setPendingCompleted((prev) => prev.filter((value) => value !== item.id));
      delete pendingTimers.current[item.id];
    }, COMPLETION_DELAY);

    pendingTimers.current[item.id] = timer;
  }

  function cancelPending(id: string, options?: { revert?: boolean }) {
    const timer = pendingTimers.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete pendingTimers.current[id];
    }
    setPendingCompleted((prev) => prev.filter((value) => value !== id));
    if (options?.revert) {
      setErledigt(id, false);
      addToast({ title: 'Abgehakt zurückgenommen', description: 'Der Eintrag bleibt offen.' });
    }
  }

  const steps = [
    { id: 1, label: 'Upload' },
    { id: 2, label: 'Erkennen' },
    { id: 3, label: 'Liste' }
  ] as const;

  const shareText = useMemo(() => buildShareText(items), [items]);
  const shareJson = useMemo(() => JSON.stringify(items, null, 2), [items]);
  const filters = useMemo(() => (['alle', 'offen', 'erledigt'] as FilterKey[]), []);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      const lower = inputValue.toLowerCase();
      const matches = vorschlaege.filter((v) => v.toLowerCase().includes(lower));
      setSuggestions(matches.slice(0, 6));
      setHighlightIndex(matches.length > 0 ? 0 : null);
    }, 120);

    return () => window.clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionListRef.current && !suggestionListRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!suggestions.length) return;
      setHighlightIndex((prev) => {
        const next = prev === null ? 0 : Math.min(prev + 1, suggestions.length - 1);
        return next;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!suggestions.length) return;
      setHighlightIndex((prev) => {
        const next = prev === null ? suggestions.length - 1 : Math.max(prev - 1, 0);
        return next;
      });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightIndex !== null && suggestions[highlightIndex]) {
        handleAddIngredient(suggestions[highlightIndex]);
      } else {
        handleAddIngredient(inputValue);
      }
    } else if (event.key === 'Escape') {
      setSuggestions([]);
      setHighlightIndex(null);
    }
  }

  function handleAddIngredient(rawName: string) {
    if (!rawName) return;
    addManualItem(rawName);
    setInputValue('');
    setSuggestions([]);
    setHighlightIndex(null);
  }

  function handleSuggestionClick(value: string) {
    handleAddIngredient(value);
  }

  function handleResetList() {
    Object.values(pendingTimers.current).forEach((timer) => window.clearTimeout(timer));
    pendingTimers.current = {};
    setPendingCompleted([]);
    resetChecks();
    addToast({ title: 'Liste zurückgesetzt', description: 'Alle Häkchen wurden entfernt.' });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col gap-6 bg-background px-4 pb-32 pt-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Intelligente Einkaufsliste</h1>
          {totalItems > 0 ? (
            <span className="text-xs text-muted-foreground">
              {totalItems} Artikel · {erledigteItems} erledigt
            </span>
          ) : null}
        </div>
        <nav aria-label="Fortschritt" className="flex items-center justify-between text-sm">
          {steps.map((step) => {
            const isActive = currentStep >= step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                    isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <span className={`text-xs ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                {step.id !== steps.length ? <div className={`ml-3 hidden h-px flex-1 sm:block ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`} /> : null}
              </div>
            );
          })}
        </nav>
      </header>

      <UploadCard
        file={file}
        previewUrl={previewUrl}
        onFileSelect={handleFileSelect}
        onClear={() => handleFileSelect(null)}
        isLoading={isExtracting}
        error={apiError}
      />

      <section className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter">
        {filters.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              filter === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            {FILTER_LABELS[key]}
          </button>
        ))}
      </section>

      <div className="relative" ref={suggestionListRef}>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Zutat hinzufügen</span>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="z. B. Karotte"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        {inputValue.trim().length >= 2 && suggestions.length > 0 ? (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {suggestions.map((suggestion, index) => {
              const isHighlighted = highlightIndex === index;
              return (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSuggestionClick(suggestion);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition ${
                    isHighlighted ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <span>{suggestion}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {isExtracting ? (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm" role="status" aria-live="polite">
          <div className="flex flex-col gap-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
            <p className="text-sm text-muted-foreground">Analysiere Rezept …</p>
          </div>
        </section>
      ) : null}

      {!isExtracting && visibleItems.length > 0 ? (
        <ListView
          items={visibleItems}
          filter={filter}
          pendingCompleted={pendingCompleted}
          onCheck={handleCheck}
          onCancelPending={(id) => cancelPending(id, { revert: true })}
          onDelete={(item) => {
            cancelPending(item.id);
            removeItem(item.id);
            setRecentlyRemoved((prev) => [item, ...prev].slice(0, 5));
          }}
          onBulkToggle={(ids, erledigt) => {
            ids.forEach((id) => cancelPending(id));
            markAll(ids, erledigt);
          }}
        />
      ) : null}

      {recentlyRemoved.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Entfernte Einträge</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const [last, ...rest] = recentlyRemoved;
                  if (!last) return;
                  restoreItem(last);
                  setRecentlyRemoved(rest);
                  addToast({ title: 'Eintrag wiederhergestellt', description: `${last.name} wurde zurückgesetzt.` });
                }}
              >
                Zuletzt rückgängig
              </Button>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {recentlyRemoved.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span>{item.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      restoreItem(item);
                      setRecentlyRemoved((prev) => prev.filter((value) => value.id !== item.id));
                    }}
                    className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Wiederherstellen
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {!isExtracting && visibleItems.length === 0 && !hasItems ? (
        <section className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
          Noch keine Einträge. Lade ein Rezeptfoto hoch, um loszulegen.
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 py-4 shadow-[0_-4px_24px_-12px_rgb(15,23,42,0.2)]">
        <div className="mx-auto flex w-full max-w-screen-sm items-center justify-between gap-3">
          {currentStep < 3 ? (
            <Button className="flex-1" size="lg" onClick={handleExtract} disabled={!file || isExtracting}>
              Einkaufsliste generieren
            </Button>
          ) : (
            <>
              {hasItems ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 border border-border bg-background hover:bg-muted"
                  onClick={handleResetList}
                >
                  Einkaufsliste zurücksetzen
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() => addToast({ title: 'Liste gespeichert', description: 'Deine intelligente Liste wurde lokal gesichert.' })}
                className="flex-1"
                size="lg"
              >
                Speichern
              </Button>
              <Button type="button" className="flex-1" size="lg" onClick={() => setShareOpen(true)}>
                Teilen
              </Button>
            </>
          )}
        </div>
      </div>

      <Sheet open={shareOpen} onOpenChange={setShareOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Teilen</SheetTitle>
            <SheetClose>✕</SheetClose>
          </SheetHeader>
          <div className="space-y-4 px-6 py-4">
            <SheetDescription>Wähle eine Option, um die Liste zu teilen.</SheetDescription>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareJson);
                  addToast({ title: 'JSON kopiert', description: 'Liste wurde in die Zwischenablage kopiert.' });
                } catch (error) {
                  console.error(error);
                  addToast({ title: 'Kopieren fehlgeschlagen', description: 'Bitte manuell kopieren.', variant: 'destructive' });
                }
              }}
            >
              JSON kopieren
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareText);
                  addToast({ title: 'Textliste kopiert', description: 'Alle Zutaten befinden sich in der Zwischenablage.' });
                } catch (error) {
                  console.error(error);
                  addToast({ title: 'Kopieren fehlgeschlagen', description: 'Bitte manuell kopieren.', variant: 'destructive' });
                }
              }}
            >
              Textliste kopieren
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                addToast({
                  title: 'Bald verfügbar',
                  description: 'Öffentlicher Link wird in Kürze unterstützt.'
                })
              }
            >
              Öffentlichen Link erstellen (bald)
            </Button>
          </div>
          <SheetFooter>
            <Button variant="secondary" onClick={() => setShareOpen(false)}>
              Schließen
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}

function buildShareText(items: EinkaufsItem[]) {
  if (items.length === 0) return 'Leere Einkaufsliste';
  const grouped = SHOPPING_SECTIONS.map((section) => {
    const sectionItems = items.filter((item) => item.kategorie === section);
    if (sectionItems.length === 0) return null;
    const lines = sectionItems.map((item) => `• ${item.name}${item.erledigt ? ' (✓)' : ''}${item.vorhanden ? ' [im Haus]' : ''}`);
    return `${section}:
${lines.join('\n')}`;
  }).filter(Boolean);
  return grouped.join('\n\n');
}
