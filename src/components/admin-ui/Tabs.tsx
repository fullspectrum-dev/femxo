"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface TabItem<K extends string> {
  key: K;
  label: string;
}

/**
 * Tabs with roving focus: arrow keys move between tabs, as the WAI-ARIA tabs
 * pattern expects. `idPrefix` links each tab to its panel
 * (`${idPrefix}-panel`), which the caller renders.
 */
export function Tabs<K extends string>({
  items,
  value,
  onChange,
  label,
  idPrefix,
  className,
}: {
  items: readonly TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
  idPrefix: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + items.length) % items.length;
    refs.current[next]?.focus();
    onChange(items[next]!.key);
  }

  return (
    <div role="tablist" aria-label={label} className={cn("fx-tabs", className)}>
      {items.map((item, index) => {
        const selected = item.key === value;
        return (
          <button
            key={item.key}
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={`${idPrefix}-tab-${item.key}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** The dark-surface range picker in the dashboard hero (7D / 30D / 90D / FY). */
export function Segmented<K extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="fx-segmented">
      {items.map((item) => (
        <button key={item.key} type="button" aria-pressed={item.key === value} onClick={() => onChange(item.key)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
