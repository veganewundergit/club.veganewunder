import Link from 'next/link';

export default function ClubDashboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Community-Übersicht</h1>
      <p className="text-muted-foreground">
        Der geschützte Club-Bereich bündelt Feed, Beiträge und weitere Inhalte. Nutze den Link unten, um den Feed zu öffnen.
      </p>
      <Link href="/club/feed" className="text-primary underline">
        Zum Community-Feed
      </Link>
    </section>
  );
}
