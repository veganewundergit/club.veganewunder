'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/shared/Button';

type ShoppingItem = {
  name: string;
  checked: boolean;
};

type ShoppingList = Record<string, ShoppingItem[]>;

const STORAGE_KEY = 'vw-shopping-list';
const SECTION_ORDER = ['Obst & Gemüse', 'Trockenware', 'Kühlregal', 'Tiefkühl', 'Sonstiges'];

function normalizeList(data: Record<string, string[]>): ShoppingList {
  const entries = Object.entries(data ?? {});
  if (!entries.length) return {};

  return entries.reduce<ShoppingList>((acc, [section, items]) => {
    acc[section] = (items ?? []).map((item) => ({
      name: item,
      checked: false
    }));
    return acc;
  }, {});
}

function isShoppingList(value: unknown): value is ShoppingList {
  if (typeof value !== 'object' || value === null) return false;
  return Object.values(value).every(
    (items) =>
      Array.isArray(items) &&
      items.every(
        (item) => typeof item === 'object' && item !== null && typeof item.name === 'string' && typeof item.checked === 'boolean'
      )
  );
}

export default function EinkaufslistePage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [list, setList] = useState<ShoppingList>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (isShoppingList(parsed)) {
          setList(parsed);
        }
      }
    } catch (storageError) {
      console.error('Konnte gespeicherte Einkaufsliste nicht laden', storageError);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = window.setTimeout(() => setStatusMessage(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;
    try {
      if (Object.keys(list).length === 0) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (storageError) {
      console.error('Konnte Einkaufsliste nicht speichern', storageError);
    }
  }, [list, hasHydrated]);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const orderedSections = useMemo(() => {
    const presentSections = Object.keys(list);
    return SECTION_ORDER.filter((section) => presentSections.includes(section)).concat(
      presentSections.filter((section) => !SECTION_ORDER.includes(section))
    );
  }, [list]);

  function handleFileChange(file: File | undefined) {
    if (!file) return;
    setImage(file);
    setError(null);
  }

  function closeCamera() {
    setIsCameraOpen(false);
  }

  function handleCapture(file: File) {
    setImage(file);
    setError(null);
    setStatusMessage('Foto übernommen. Du kannst jetzt die Liste generieren.');
  }

  function handleCameraClick() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      cameraInputRef.current?.click();
      setCameraError('Dein Gerät unterstützt keinen direkten Kamera-Zugriff. Bitte wähle ein Foto aus.');
      return;
    }

    setCameraError(null);
    setIsCameraOpen(true);
  }

  async function handleGenerate() {
    if (!image) {
      setError('Bitte wähle ein Bild oder Foto aus.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-list', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error ?? 'Die Einkaufsliste konnte nicht generiert werden.');
      }

      const payload = (await response.json()) as Record<string, string[]>;
      const normalized = normalizeList(payload);

      if (Object.keys(normalized).length === 0) {
        setError('Es konnten keine Zutaten erkannt werden. Bitte versuche es mit einem anderen Bild.');
      }

      setList(normalized);
      setStatusMessage('Einkaufsliste aktualisiert.');
    } catch (generationError) {
      console.error(generationError);
      setError(generationError instanceof Error ? generationError.message : 'Unerwarteter Fehler bei der Generierung.');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleItem(section: string, index: number) {
    setList((prev) => {
      const items = prev[section];
      if (!items) return prev;
      const updatedSection = items.map((item, idx) =>
        idx === index ? { ...item, checked: !item.checked } : item
      );
      return {
        ...prev,
        [section]: updatedSection
      };
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold">Einkaufslisten-Generator</h1>
        <p className="text-sm text-muted-foreground">
          Lade ein Rezeptfoto hoch und erhalte eine strukturierte Einkaufsliste mit allen Zutaten.
        </p>
      </header>

      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-sm">
          <h2 className="font-medium">Rezeptfoto oder Screenshot</h2>
          <p className="text-muted-foreground">
            Wähle ein vorhandenes Bild oder nimm direkt ein Foto vom Rezept auf.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Bild auswählen
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCameraClick}
          >
            Foto aufnehmen
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />

        {previewUrl ? (
          <div className="flex justify-center">
            <img src={previewUrl} alt="Rezeptvorschau" className="max-w-sm rounded-lg border border-border" />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Analysiere Bild…' : 'Einkaufsliste generieren'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setStatusMessage('Speichern folgt bald')}>
            Liste speichern
          </Button>
          <Button type="button" variant="secondary" onClick={() => setStatusMessage('Teilen-Funktion folgt bald')}>
            Teilen
          </Button>
        </div>

        {cameraError ? <p className="text-sm text-destructive">{cameraError}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {statusMessage ? <p className="text-sm text-primary">{statusMessage}</p> : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Deine Einkaufsliste</h2>
        <p className="text-sm text-muted-foreground">
          Markiere ab, was schon im Einkaufswagen ist – alles bleibt lokal auf deinem Gerät gespeichert.
        </p>

        {Object.keys(list).length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Noch keine Liste vorhanden. Lade ein Rezeptfoto hoch, um loszulegen.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {orderedSections.map((section) => {
              const items = list[section];
              if (!items || items.length === 0) return null;

              return (
                <div key={section}>
                  <h3 className="text-lg font-semibold">{section}</h3>
                  <ul className="mt-3 space-y-2">
                    {items.map((item, index) => (
                      <li key={`${section}-${item.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(section, index)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : ''}`}>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {isCameraOpen ? (
        <CameraCapture
          onCapture={(file) => {
            handleCapture(file);
            closeCamera();
          }}
          onClose={closeCamera}
          onError={(message) => {
            setCameraError(message);
            cameraInputRef.current?.click();
            closeCamera();
          }}
          onFallbackToUpload={() => cameraInputRef.current?.click()}
        />
      ) : null}
    </main>
  );
}

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  onError: (message: string) => void;
  onFallbackToUpload: () => void;
}

function CameraCapture({ onCapture, onClose, onError, onFallbackToUpload }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsStarting(false);
      } catch (error) {
        console.error('Kamera konnte nicht gestartet werden', error);
        onError('Kamera konnte nicht gestartet werden. Bitte erteile Zugriffsrechte oder verwende den Upload.');
        onFallbackToUpload();
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onError, onFallbackToUpload]);

  async function captureFrame() {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      onError('Das Kamerabild konnte nicht verarbeitet werden.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        onError('Das Foto konnte nicht erstellt werden.');
        return;
      }

      const file = new File([blob], `rezept-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
      onCapture(file);
    }, 'image/jpeg');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-xl">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            autoPlay
            muted
          />
          {isStarting ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">
              Kamera wird gestartet…
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="button" onClick={captureFrame}>
            Foto übernehmen
          </Button>
        </div>
      </div>
    </div>
  );
}
