'use client';

import { useMemo } from 'react';

interface FeedPost {
  id: string;
  title: string;
  user: string;
  message: string;
  category: ClubCategory;
}

    title: 'Neu hier? Sag Hallo!',
    user: 'Lena',
    message: 'Ich freue mich, Teil der Community zu sein. Wer hat Tipps für vegane Snacks unterwegs?',
    category: 'Allgemein'
  },
  {
    id: 'allgemein-2',
    title: 'Wöchentliche Check-in-Runde',
    user: 'Chris',
    message: 'Wie läuft eure Woche bisher? Teilt eure Highlights oder Herausforderungen!',
    category: 'Allgemein'
  },
  {
    id: 'ernaehrung-1',
    title: 'Proteinreich durch den Tag',
    user: 'Marco',
    message: 'Meine liebsten Hülsenfrüchte-Kombinationen für schnelle Bowls.',
    category: 'Ernährung'
  },
  {
    id: 'ernaehrung-2',
    title: 'Supplements im Winter',
    user: 'Anja',
    message: 'Welche Supplement-Routinen habt ihr für dunkle Monate?',
    category: 'Ernährung'
  },
  {
    id: 'rezepte-1',
    title: 'Wärmt von innen: Kürbis-Laksa',
    user: 'Chris',
    message: 'Schnelles, aromatisches Rezept mit Kokosmilch und viel Gemüse.',
    category: 'Rezepte'
  },
  {
    id: 'rezepte-2',
    title: 'Meal Prep Sonntagsritual',
    user: 'Tobi',
    message: 'So plane ich 3 Tage vegane Lunches in 1 Stunde.',
    category: 'Rezepte'
  },
  {
    id: 'mindset-1',
    title: 'Motiviert bleiben',
    user: 'Sarah',
    message: 'Meine 5 Affirmationen, wenn es hektisch wird.',
    category: 'Mindset'
  },
  {
    id: 'mindset-2',
    title: 'Selbstfürsorge & Grenzen',
    user: 'Chris',
    message: 'Wie gehst du mit Gegenwind aus deinem Umfeld um?',
    category: 'Mindset'
  },
  {
    id: 'tierschutz-1',
    title: 'Spendenaktion Dezember',
    user: 'Lena',
    message: 'Wir unterstützen einen lokalen Lebenshof. Wer macht mit?',
    category: 'Tierschutz'
  },
  {
    id: 'tierschutz-2',
    title: 'Volunteering-Tipps',
    user: 'Marco',
    message: 'Erfahrungen aus dem Tierheim-Einsatz vom Wochenende.',
    category: 'Tierschutz'
const posts: FeedPost[] = [
  {
    id: 'allgemein-1',
    title: 'Neu hier? Sag Hallo!',
    user: 'Lena',
    message: 'Ich freue mich, Teil der Community zu sein. Wer hat Tipps für vegane Snacks unterwegs?',
    category: 'Allgemein'
  },
  {
    id: 'allgemein-2',
    title: 'Wöchentliche Check-in-Runde',
    user: 'Chris',
    message: 'Wie läuft eure Woche bisher? Teilt eure Highlights oder Herausforderungen!',
    category: 'Allgemein'
  },
  {
    id: 'ernaehrung-1',
    title: 'Proteinreich durch den Tag',
    user: 'Marco',
    message: 'Meine liebsten Hülsenfrüchte-Kombinationen für schnelle Bowls.',
    category: 'Ernährung'
  },
  {
    id: 'ernaehrung-2',
    title: 'Supplements im Winter',
    user: 'Anja',
    message: 'Welche Supplement-Routinen habt ihr für dunkle Monate?',
    category: 'Ernährung'
  },
  {
    id: 'rezepte-1',
    title: 'Wärmt von innen: Kürbis-Laksa',
    user: 'Chris',
    message: 'Schnelles, aromatisches Rezept mit Kokosmilch und viel Gemüse.',
    category: 'Rezepte'
  },
  {
    id: 'rezepte-2',
    title: 'Meal Prep Sonntagsritual',
    user: 'Tobi',
    message: 'So plane ich 3 Tage vegane Lunches in 1 Stunde.',
    category: 'Rezepte'
  },
  {
    id: 'mindset-1',
    title: 'Motiviert bleiben',
    user: 'Sarah',
    message: 'Meine 5 Affirmationen, wenn es hektisch wird.',
    category: 'Mindset'
  },
  {
    id: 'mindset-2',
    title: 'Selbstfürsorge & Grenzen',
    user: 'Chris',
    message: 'Wie gehst du mit Gegenwind aus deinem Umfeld um?',
    category: 'Mindset'
  },
  {
    id: 'tierschutz-1',
    title: 'Spendenaktion Dezember',
    user: 'Lena',
    message: 'Wir unterstützen einen lokalen Lebenshof. Wer macht mit?',
    category: 'Tierschutz'
  },
  {
    id: 'tierschutz-2',
    title: 'Volunteering-Tipps',
    user: 'Marco',
    message: 'Erfahrungen aus dem Tierheim-Einsatz vom Wochenende.',
    category: 'Tierschutz'
  }
];

export interface ClubFeedProps {
  category: ClubCategory;
}

export type ClubCategory = 'Allgemein' | 'Ernährung' | 'Rezepte' | 'Mindset' | 'Tierschutz';

export function ClubFeed({ category }: ClubFeedProps) {
  const filteredPosts = useMemo(
    () => posts.filter((post) => post.category === category),
    [category]
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {filteredPosts.map((post) => (
        <article
          key={post.id}
          className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <header className="space-y-1">
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-sm text-muted-foreground">von {post.user}</p>
          </header>
          <p className="text-sm leading-6 text-muted-foreground">{post.message}</p>
          <footer className="mt-auto text-xs uppercase tracking-wide text-primary/80">
            #{post.category}
          </footer>
        </article>
      ))}
    </div>
  );
}
