import type { Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user';
import { createSupabaseServerClient, type SupabaseServerContext } from '@/lib/supabaseClient';
import { getMembershipStatus } from '@/lib/stripe';

const DEV_BYPASS_FLAG = 'NEXT_PUBLIC_DEV_BYPASS';

export function isDevBypassEnabled() {
  return process.env[DEV_BYPASS_FLAG] === 'true';
}

export async function getSession(context: SupabaseServerContext): Promise<Session | null> {
  const supabase = createSupabaseServerClient(context);

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getCurrentUserProfile(context: SupabaseServerContext) {
  const supabase = createSupabaseServerClient(context);

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from('profiles').select('*').single<UserProfile>();
  return data ?? null;
}

export async function ensureClubAccess(stripeCustomerId?: string) {
  if (isDevBypassEnabled()) {
    return {
      allowed: true,
      reason: 'dev-bypass'
    } as const;
  }

  if (!stripeCustomerId) {
    return {
      allowed: false,
      reason: 'missing-user'
    } as const;
  }

  const membership = await getMembershipStatus(stripeCustomerId);

  return {
    allowed: membership.active,
    reason: membership.active ? 'stripe-active' : 'stripe-inactive'
  } as const;
}
