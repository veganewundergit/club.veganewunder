import type { ReactNode } from 'react';
import { Suspense } from 'react';

// Placeholder für Club-spezifische Layout-Anpassungen, z. B. Sidebar oder Breadcrumbs.
export default function ClubLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6">Lade Club-Inhalte...</div>}>
      <section className="flex flex-col gap-6">{children}</section>
    </Suspense>
  );
}
