'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/Button';

export function LoginForm() {
  const [email, setEmail] = useState('');

  return (
    <form className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span>E-Mail</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="rounded-md border border-border bg-background p-3"
        />
      </label>
      <Button type="submit">Mit Supabase anmelden</Button>
      <p className="text-xs text-muted-foreground">
        Auth-Flow wird später mit Supabase implementiert.
      </p>
    </form>
  );
}
