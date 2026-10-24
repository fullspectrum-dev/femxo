"use client";

import { useId, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "../cn";

export interface TabItem<K extends string> {
  key: K;
  label: string;
  content: ReactNode;
}

/**
 * WAI-ARIA tabs with roving focus: arrow keys move between tabs (wrapping),
 * Home / End jump to the ends, and the panel follows the selection.
 */
export function Tabs<K extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: readonly TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
  className?: string;
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = items.find((item) => item.key === value) ?? items[0]!;

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = items.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next]!.key);
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
        {items.map((item, index) => {
          const selected = item.key === active.key;
          return (
            <button
              key={item.key}
              ref={(element) => {
                refs.current[index] = element;
              }}
              id={`${id}-tab-${item.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "-mb-px h-11 whitespace-nowrap border-b-2 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus",
                selected ? "border-primary text-primary" : "border-transparent text-ink-muted hover:text-ink"
              )}
              onClick={() => onChange(item.key)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active.key}`} tabIndex={0} className="pt-4 focus-visible:outline-2 focus-visible:outline-focus">
        {active.content}
      </div>
    </div>
  );
}
