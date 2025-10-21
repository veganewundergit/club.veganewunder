'use client';

import * as React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, checked, onCheckedChange, className, ...props },
  ref
) {
  return (
    <input
      id={id}
      ref={ref}
      type="checkbox"
      className={`h-5 w-5 rounded border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${className ?? ''}`}
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      {...props}
    />
  );
});
