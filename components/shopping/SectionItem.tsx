'use client';

import { Checkbox } from '@/components/ui/checkbox';

interface SectionItemProps {
  section: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  index: number;
}

export function SectionItem({ section, label, checked, onChange, index }: SectionItemProps) {
  const id = `section-${section}-${index}`;

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
      <label htmlFor={id} className={`flex-1 text-sm ${checked ? 'text-muted-foreground line-through' : ''}`}>
        {label}
      </label>
    </li>
  );
}
