'use client';

import { useEffect, useMemo, useState } from 'react';
import { UploadCard } from '@/components/shopping/UploadCard';
import { ListView } from '@/components/shopping/ListView';
import { useShoppingList } from '@/hooks/useShoppingList';
import { Button } from '@/components/shared/Button';
import { SHOPPING_SECTIONS, sanitizeShoppingList } from '@/lib/shopping';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';

type Step = 1 | 2 | 3;

export default function EinkaufslistePage() {
  const { list, setList, checked, setChecked, bulkCheck, reset, saveLocal, normalizeFromApi } = useShoppingList();
  const { addToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const hasList = useMemo(() => {
    const sanitized = sanitizeShoppingList(list);
    return Object.values(sanitized).some((items) => (items?.length ?? 0) > 0);
  }, [list]);

  const currentStep: Step = useMemo(() => {
    if (isExtracting) return 2;
    if (hasList) return 3;
    if (file) return 2;
    return 1;
  }, [file, hasList, isExtracting]);

  const totalItems = useMemo(() => {
    return Object.values(list ?? {}).reduce((sum, items) => sum + (items?.length ?? 0), 0);
  }, [list]);

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
      const normalized = normalizeFromApi(payload);
      setList(normalized);

      addToast({
        title: 'Einkaufsliste aktualisiert',
        description: 'Alle Zutaten sind gruppiert nach Supermarkt-Sektionen.',
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
    }
  }

  function handleSave() {
    saveLocal();
    addToast({
      title: 'Einkaufsliste gespeichert',
      description: 'Deine Liste wurde lokal gesichert.'
    });
  }

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(list, null, 2));
      addToast({ title: 'JSON kopiert', description: 'Liste wurde in die Zwischenablage kopiert.' });
    } catch (error) {
      console.error(error);
      addToast({ title: 'Kopieren fehlgeschlagen', description: 'Bitte manuell kopieren.', variant: 'destructive' });
    }
  }

  async function handleCopyText() {
    try {
      const lines = SHOPPING_SECTIONS.map((section) => {
        const items = list[section];
        if (!items || items.length === 0) return null;
        return `${section}:\n${items.map((item) => `• ${item}`).join('\n')}`;
      }).filter(Boolean);
      await navigator.clipboard.writeText(lines.join('\n\n'));
      addToast({ title: 'Textliste kopiert', description: 'Alle Zutaten befinden sich in der Zwischenablage.' });
    } catch (error) {
      console.error(error);
      addToast({ title: 'Kopieren fehlgeschlagen', description: 'Bitte manuell kopieren.', variant: 'destructive' });
    }
  }

  function handleResetChecks() {
    SHOPPING_SECTIONS.forEach((section) => bulkCheck(section, false));
  }

  const steps = [
    { id: 1, label: 'Upload' },
    { id: 2, label: 'Erkennen' },
    { id: 3, label: 'Liste' }
  ] as const;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col gap-6 bg-background px-4 pb-32 pt-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Einkaufslisten-Generator</h1>
          {totalItems > 0 ? <span className="text-xs text-muted-foreground">{totalItems} Artikel</span> : null}
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

      {isExtracting ? (
        <section
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          role="status"
          aria-live="polite"
        >
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

      {hasList && !isExtracting ? (
        <ListView
          list={list}
          checked={checked}
          onToggle={setChecked}
          onBulk={bulkCheck}
          onReset={handleResetChecks}
        />
      ) : null}

      {!hasList && !isExtracting && !file ? (
        <section className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
          Noch keine Liste vorhanden. Lade ein Rezeptfoto hoch, um loszulegen.
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 py-4 shadow-[0_-4px_24px_-12px_rgb(15,23,42,0.2)]">
        <div className="mx-auto flex w-full max-w-screen-sm items-center justify-between gap-3">
          {currentStep < 3 ? (
            <Button
              className="flex-1"
              size="lg"
              onClick={handleExtract}
              disabled={!file || isExtracting}
            >
              Einkaufsliste generieren
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={handleSave} className="flex-1" size="lg">
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
            <Button type="button" variant="secondary" onClick={handleCopyJson}>
              JSON kopieren
            </Button>
            <Button type="button" variant="secondary" onClick={handleCopyText}>
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
