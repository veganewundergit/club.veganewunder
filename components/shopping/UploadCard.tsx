'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/shared/Button';

interface UploadCardProps {
  file: File | null;
  previewUrl: string | null;
  isLoading: boolean;
  onFileSelect: (file: File | null) => void;
  onClear: () => void;
  error?: string | null;
  sizeLimitMb?: number;
}

const DEFAULT_LIMIT_MB = 10;

export function UploadCard({
  file,
  previewUrl,
  isLoading,
  onFileSelect,
  onClear,
  error,
  sizeLimitMb = DEFAULT_LIMIT_MB
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const limitInBytes = sizeLimitMb * 1024 * 1024;

  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  function handleChange(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const next = files[0];
    if (next.size > limitInBytes) {
      setLocalError(`Datei ist zu groß (${(next.size / (1024 * 1024)).toFixed(1)} MB). Maximum ${sizeLimitMb} MB.`);
      return;
    }

    setLocalError(null);
    onFileSelect(next);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <header className="space-y-2">
          <h2 className="text-lg font-semibold">Foto oder Screenshot eines Rezepts hochladen.</h2>
          <p className="text-sm text-muted-foreground">
            Unterstützt Bilder bis {sizeLimitMb} MB. Achte auf gut lesbare Zutaten.
          </p>
        </header>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleChange(event.target.files)}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
          >
            Foto aufnehmen / Bild hochladen
          </Button>
          {file ? (
            <span className="text-xs text-muted-foreground">
              {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          ) : null}
        </div>

        {!isMobile ? (
          <p className="text-xs text-muted-foreground">
            Hinweis: Auf Desktop-Geräten steht nur der Dateiupload zur Verfügung. Für direkte Fotoaufnahmen bitte ein Smartphone nutzen.
          </p>
        ) : null}

        {(error || localError) ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error ?? localError}
          </p>
        ) : null}

        {previewUrl ? (
          <figure className="relative overflow-hidden rounded-xl border border-border">
            <Image
              src={previewUrl}
              alt="Rezeptvorschau"
              className="h-full w-full object-cover"
              width={900}
              height={600}
              unoptimized
            />
            <footer className="flex items-center justify-between border-t border-border bg-card/80 px-4 py-2 text-xs text-muted-foreground">
              <span>Vorschau</span>
              <button
                type="button"
                className="text-primary underline-offset-2 hover:underline"
                onClick={() => {
                  setLocalError(null);
                  onClear();
                }}
              >
                Entfernen
              </button>
            </footer>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
