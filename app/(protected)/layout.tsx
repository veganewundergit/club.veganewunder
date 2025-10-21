import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';

// Diese Layout-Komponente kapselt alle geschützten Club-Routen.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
        {children}
      </main>
    </div>
  );
}
