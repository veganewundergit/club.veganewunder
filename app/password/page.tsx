import { Suspense } from 'react';
import { PasswordForm } from './PasswordForm';

export default function PasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <header className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Passwort eingeben</h1>
          <p className="text-sm text-muted-foreground">
            Der Vegane Wunder Club ist geschützt. Bitte gib das aktuelle Zugangspasswort ein.
          </p>
        </header>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Lädt…</p>}>
          <PasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
