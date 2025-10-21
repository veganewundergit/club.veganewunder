"use client";

import * as React from "react";

interface AccordionContextValue {
  value: string[];
  toggle: (value: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function Accordion({ children, className, type = "single", value, onValueChange, ...props }: AccordionProps) {
  const allowMultiple = type === "multiple";

  const toggle = React.useCallback(
    (item: string) => {
      if (allowMultiple) {
        const set = new Set(value);
        if (set.has(item)) {
          set.delete(item);
        } else {
          set.add(item);
        }
        onValueChange(Array.from(set));
      } else {
        onValueChange(value.includes(item) ? [] : [item]);
      }
    },
    [allowMultiple, onValueChange, value]
  );

  const contextValue = React.useMemo<AccordionContextValue>(
    () => ({
      value,
      toggle,
      allowMultiple
    }),
    [allowMultiple, toggle, value]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function AccordionItemBase({ children, value, className, ...props }: AccordionItemProps) {
  return (
    <div data-accordion-item={value} className={className} {...props}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AccordionTrigger({ children, className, ...props }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionTrigger must be used within Accordion");
  }

  const { value, toggle } = context;
  const parent = React.useContext(AccordionItemValueContext);
  const isOpen = value.includes(parent);

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={() => toggle(parent)}
      className={`w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className ?? ""}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        {children}
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden>
          ▼
        </span>
      </div>
    </button>
  );
}

const AccordionItemValueContext = React.createContext<string>("__UNKNOWN__");

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AccordionContent({ children, className, ...props }: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionContent must be used within Accordion");
  }

  const { value } = context;
  const itemValue = React.useContext(AccordionItemValueContext);
  const isOpen = value.includes(itemValue);

  return (
    <div
      role="region"
      hidden={!isOpen}
      className={`overflow-hidden ${className ?? ""}`}
      {...props}
    >
      {isOpen ? children : null}
    </div>
  );
}

export function AccordionItem({ value, children, ...props }: AccordionItemProps) {
  return (
    <AccordionItemValueContext.Provider value={value}>
      <AccordionItemBase value={value} {...props}>
        {children}
      </AccordionItemBase>
    </AccordionItemValueContext.Provider>
  );
}
