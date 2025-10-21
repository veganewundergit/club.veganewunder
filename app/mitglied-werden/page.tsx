import { Button } from '@/components/shared/Button';

const tiers = [
  {
    name: 'Vegane Wunder Basis',
    price: '5 €/Monat',
    icon: '🌱',
    description: 'Fans & Einsteiger',
    perks: ['4 exklusive Kurzvideos', 'Einkaufsliste', 'Community-Zugang']
  },
  {
    name: 'Vegane Wunder Plus',
    price: '12 €/Monat',
    icon: '🌿',
    description: 'Motivierte Mitglieder',
    perks: ['Alles aus Tier 1', '1 Langform-Video', 'PDF-Plan', 'Q&A mit Chris']
  },
  {
    name: 'Vegane Wunder Pro',
    price: '25 €/Monat',
    icon: '🌳',
    description: 'Hardcore-Fans & Supporter',
    perks: ['Alles aus Tier 2', 'Direkter Chat', 'Early Access', 'Exklusive Rabatte']
  }
];

export default function MembershipPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-16 sm:py-20">
      <header className="space-y-6 text-center">
        <span className="mx-auto inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Werde Teil vom Vegane Wunder Club
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Werde Teil vom Vegane Wunder Club</h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            Ob du gerade erst vegan durchstartest oder schon mit ganzem Herzen dabei bist – hier findest du genau das
            richtige Maß an Inspiration, Wissen und persönlicher Begleitung.
          </p>
        </div>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          Hey, ich bin Chris – Gastgeber des Vegane Wunder Clubs und seit vielen Jahren leidenschaftlich vegan. Die
          Mitgliedschaften helfen mir, Inhalte zu finanzieren und dir einen Raum voller Austausch, Motivation und
          Support zu bieten.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{tier.name}</h2>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <span className="text-3xl">{tier.icon}</span>
            </div>
            <p className="text-3xl font-bold text-primary">{tier.price}</p>
            <ul className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-left">
                  <span className="mt-0.5 text-primary">✔️</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant="primary">
              Jetzt beitreten
            </Button>
          </article>
        ))}
      </section>
    </main>
  );
}
