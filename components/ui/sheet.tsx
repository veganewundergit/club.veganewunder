"use client";

import * as React from "react";

interface SheetContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined);

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return <SheetContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("SheetTrigger must be used within Sheet");

  return (
    <button type="button" onClick={() => context.setOpen(true)} className="inline-flex items-center justify-center">
      {children}
    </button>
  );
}

export function SheetContent({ children }: { children: React.ReactNode }) {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("SheetContent must be used within Sheet");

  const { open, setOpen } = context;

  React.useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKey);
    }

    return () => window.removeEventListener('keydown', handleKey);
  }, [open, setOpen]);

  return (
    <div
      role="dialog"
      aria-modal
      className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl border border-border bg-card shadow-lg transition-transform duration-200 ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="relative max-h-[85vh] overflow-y-auto">{children}</div>
    </div>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <header className="flex items-center justify-between border-b border-border px-6 py-4">{children}</header>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function SheetDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function SheetFooter({ children }: { children: React.ReactNode }) {
  return <footer className="flex flex-col gap-2 border-t border-border px-6 py-4">{children}</footer>;
}

export function SheetClose({ children }: { children: React.ReactNode }) {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("SheetClose must be used within Sheet");

  return (
    <button
      type="button"
      aria-label="Sheet schließen"
      onClick={() => context.setOpen(false)}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
}
