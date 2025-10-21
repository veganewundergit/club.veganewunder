import Link from 'next/link';
import { Button } from '@/components/shared/Button';

const features = [
  {
    title: 'Rezepte & Tipps',
    description: 'Frische Ideen und alltagstaugliche Hacks für einen pflanzlichen Lebensstil.',
    icon: '🥦'
  },
  {
    title: 'Austausch & Support',
    description: 'Finde Gleichgesinnte, teile Fragen und erhalte wertschätzendes Feedback.',
    icon: '🫶'
  },
  {
    title: 'Motivation & Inspiration',
    description: 'Lass dich von Erfolgsstories, Challenges und Events motivieren.',
    icon: '✨'
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-16 sm:py-20">
      <section className="flex flex-col gap-10 text-center sm:gap-12">
        <span className="mx-auto inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Vegane Wunder Community
        </span>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Dein sicherer Ort für veganes Leben &amp; echten Austausch
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Finde Gleichgesinnte, teile Erfahrungen &amp; werde Teil einer unterstützenden Community.
            Wir feiern pflanzliche Vielfalt, Mut und Motivation – ganz ohne Bewertung.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4 sm:flex-row sm:items-center">
          <Button asChild size="lg">
            <Link href="/mitglied-werden">Mitglied werden</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/club">Zum Club</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/einkaufsliste">Einkaufsliste generieren</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="text-3xl">{feature.icon}</span>
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
