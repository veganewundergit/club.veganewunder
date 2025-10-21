'use client';

import { useState } from 'react';
import { ClubFeed, type ClubCategory } from '@/components/ClubFeed';

const categories: ClubCategory[] = ['Allgemein', 'Ernährung', 'Rezepte', 'Mindset', 'Tierschutz'];

const tabClass =
  'rounded-full border px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

export default function ClubLandingPage() {
  const [activeCategory, setActiveCategory] = useState<ClubCategory>('Allgemein');

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-16 sm:py-20">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">👥 Vegane Wunder Club</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Willkommen im Herzstück der Community. Wähle eine Kategorie und entdecke, worüber sich Mitglieder gerade
          austauschen. Alles ist Demo-Content – bereit, später mit Supabase zum Leben erweckt zu werden.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`${tabClass} ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30'
              }`}
            >
              {category}
            </button>
          );
        })}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Aktuelle Themen – {activeCategory}</h2>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Demo-Inhalte</p>
        </div>
        <ClubFeed category={activeCategory} />
      </section>
    </main>
  );
}
