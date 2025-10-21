import { createBrowserClient, createServerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};

export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn('Supabase Browser Client not initialised. Environment variables fehlen.');
    return null;
  }

  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}

export function createSupabaseServerClient(): SupabaseClient | null {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn('Supabase Server Client not initialised. Environment variables fehlen.');
    return null;
  }

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value;
      },
      set(name: string, value: string, options?: { path?: string; maxAge?: number }) {
        const cookieStore = cookies();
        cookieStore.set(name, value, options);
      },
      remove(name: string) {
        const cookieStore = cookies();
        cookieStore.delete(name);
      }
    }
  });
}

export async function getBrowserSession(client?: SupabaseClient): Promise<Session | null> {
  const supabase = client ?? createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}
