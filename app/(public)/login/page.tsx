import Link from 'next/link';
import { LoginForm } from './_components/LoginForm';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 p-6">
      <header className="text-center">
        <h1 className="text-3xl font-semibold">Mitgliedsanmeldung</h1>
        <p className="text-sm text-muted-foreground">Nutze deine Club-Zugangsdaten oder teste den Dev-Bypass.</p>
      </header>
      <LoginForm />
      <p className="text-center text-sm">
        Noch kein Zugang?{' '}
        <Link href="/mitglied-werden" className="text-primary underline">
          Jetzt Mitglied werden
        </Link>
      </p>
    </main>
  );
}
