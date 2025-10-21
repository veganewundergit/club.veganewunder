import Link from 'next/link';

export default function MembershipPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-8">
      <section>
        <h1 className="text-4xl font-semibold">Mitglied werden</h1>
        <p className="mt-2 text-muted-foreground">
          Hier entsteht eine Stripe-basierte Mitgliedschaft. Bis dahin dient diese Seite als Platzhalter.
        </p>
      </section>
      <section className="rounded-lg border border-dashed p-6">
        <h2 className="text-xl font-medium">Stripe-Checkout folgt</h2>
        <p className="text-sm text-muted-foreground">
          In der finalen Version löst ein Button den Stripe-Checkout aus und überprüft den Zugang für den Club.
        </p>
      </section>
      <Link href="/login" className="text-primary underline">
        Bereits Mitglied? Zum Login
      </Link>
    </main>
  );
}
