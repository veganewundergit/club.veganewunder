'use client';

import * as React from 'react';

interface CheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  animated?: boolean;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked = false, animated = true, className, onClick, ...props },
  ref
) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative flex h-6 w-6 items-center justify-center rounded-full border border-border transition ${
        checked ? 'border-primary bg-primary' : 'bg-background'
      } ${animated ? 'duration-300 ease-out' : ''} ${className ?? ''}`}
      {...props}
    >
      <span
        className={`pointer-events-none block h-3 w-3 rounded-full transition-transform duration-300 ease-out ${
          checked ? 'scale-100 bg-primary-foreground' : 'scale-0 bg-transparent'
        }`}
      />
    </button>
  );
});
