'use client';

import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user';

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  isDevBypassEnabled: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  isDevBypassEnabled: process.env.NEXT_PUBLIC_DEV_BYPASS === 'true',
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user })
}));
