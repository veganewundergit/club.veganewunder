'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/shared/Button';

export default function PasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTarget = searchParams.get('redirectTo') ?? '/';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password,
          redirectTo: redirectTarget
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message ?? 'Passwort ist nicht korrekt. Bitte versuche es erneut.');
        setIsSubmitting(false);
        return;
      }

      router.replace(result.redirectTo ?? redirectTarget);
      router.refresh();
    } catch (submissionError) {
      console.error(submissionError);
      setError('Es ist ein Fehler aufgetreten. Bitte versuche es erneut.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <header className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Passwort eingeben</h1>
          <p className="text-sm text-muted-foreground">
            Der Vegane Wunder Club ist geschützt. Bitte gib das aktuelle Zugangspasswort ein.
          </p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm">
            <span>Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border border-border bg-background p-3 text-base"
              placeholder="Passwort"
              required
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Prüfe Passwort…' : 'Bestätigen'}
          </Button>
        </form>
      </div>
    </main>
  );
}
