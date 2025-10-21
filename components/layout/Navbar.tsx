import Link from 'next/link';
import { Button } from '@/components/shared/Button';

const navigation = [
  { href: '/', label: 'Start' },
  { href: '/mitglied-werden', label: 'Mitglied werden' },
  { href: '/login', label: 'Login' },
  { href: '/club/feed', label: 'Club Feed' }
];

export function Navbar() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 p-4">
        <Link href="/" className="text-lg font-semibold">
          Vegane Wunder Club
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Anmelden</Link>
        </Button>
      </div>
    </header>
  );
}
