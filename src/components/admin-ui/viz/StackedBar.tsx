"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface StackedPart {
  key: string;
  label: string;
  value: number;
  /** A CSS colour, normally a --fx-viz-* token. */
  color: string;
}

/**
 * Part-to-whole as one horizontal bar: segments separated by a 2px surface
 * gap, and a legend that carries every number (labels never sit inside a
 * segment, so nothing is clipped). Hovering a segment or a legend row
 * highlights the pair.
 */
export function StackedBar({
  parts,
  formatValue,
  label,
}: {
  parts: readonly StackedPart[];
  formatValue: (value: number) => string;
  label: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  const percent = (value: number) => `${((value / total) * 100).toFixed(value / total < 0.1 ? 1 : 0)}%`;

  return (
    <div onPointerLeave={() => setActive(null)}>
      <div className="fx-stack" role="img" aria-label={`${label}: ${parts.map((part) => `${part.label} ${percent(part.value)}`).join(", ")}`}>
        {parts.map((part) => (
          <span
            key={part.key}
            className="fx-stack-part"
            data-dim={active !== null && active !== part.key ? true : undefined}
            style={{ flexGrow: part.value, background: part.color }}
            onPointerEnter={() => setActive(part.key)}
          />
        ))}
      </div>
      <ul className="mt-4 grid gap-1">
        {parts.map((part) => (
          <li
            key={part.key}
            className={cn("fx-legend-row", active === part.key && "fx-legend-row--active")}
            onPointerEnter={() => setActive(part.key)}
          >
            <span className="h-2.5 w-2.5 flex-none rounded-[3px]" style={{ background: part.color }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{part.label}</span>
            <span className="font-semibold fx-num">{formatValue(part.value)}</span>
            <span className="w-12 text-right text-[12px] fx-muted fx-num">{percent(part.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
