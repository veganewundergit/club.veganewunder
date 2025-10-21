import { createPagesBrowserClient, createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};

export function createSupabaseBrowserClient() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn('Supabase Browser Client not initialised. Environment variables fehlen.');
    return null;
  }

  return createPagesBrowserClient({ supabaseUrl: supabaseConfig.url, supabaseKey: supabaseConfig.anonKey });
}

export type SupabaseServerContext = Parameters<typeof createPagesServerClient>[0];

export function createSupabaseServerClient(context: SupabaseServerContext) {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn('Supabase Server Client not initialised. Environment variables fehlen.');
    return null;
  }

  return createPagesServerClient(context);
}

export async function getBrowserSession(client?: SupabaseClient): Promise<Session | null> {
  const supabase = client ?? createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}
