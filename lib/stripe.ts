import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

export function getStripeServerClient(): Stripe | null {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.warn('Stripe Secret Key missing. Stripe client is disabled for now.');
    return null;
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16'
    });
  }

  return stripeSingleton;
}

export async function getMembershipStatus(customerId: string) {
  // Platzhalter für die spätere Stripe-Implementierung.
  return {
    customerId,
    active: false,
    currentPeriodEnd: null
  } as const;
}
