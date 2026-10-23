"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Shared pieces of the dashboard charts. Charts draw at their real pixel
 * width (measured, not a stretched viewBox) so text stays crisp and marks
 * keep the specified thickness at every size.
 */

/** Width of an element, kept up to date as it resizes. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry!.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Round axis ticks from 0: 0 / 20 / 40 / 60 / 80. */
export function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= raw)!;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);
}

/** Indices to label on an x axis so labels never crowd: always the first and the last. */
export function labelIndices(count: number, maxLabels: number) {
  if (count <= maxLabels) return new Set(Array.from({ length: count }, (_, index) => index));
  const step = Math.ceil((count - 1) / (maxLabels - 1));
  const picked = new Set<number>();
  for (let index = 0; index < count; index += step) picked.add(index);
  // Drop the label just before the last one if it would sit closer than a step.
  const last = count - 1;
  for (const index of picked) if (last - index < step && index !== 0) picked.delete(index);
  picked.add(last);
  return picked;
}

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
  /** "line" mirrors a line series, "box" a bar or area. */
  mark?: "line" | "box";
}

/**
 * The hover / focus readout. The value leads (strong), the series name
 * follows (muted). It sits right of the point, left when there's no room,
 * and is kept inside the chart when neither side fits (narrow cards).
 */
export function ChartTooltip({
  title,
  rows,
  footer,
  x,
  y,
  containerWidth,
}: {
  title: string;
  rows: readonly TooltipRow[];
  footer?: ReactNode;
  x: number;
  y: number;
  containerWidth: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(180);
  useLayoutEffect(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  }, [title, rows, footer]);
  const gap = 12;
  const left =
    x + gap + width <= containerWidth
      ? x + gap
      : x - gap - width >= 0
        ? x - gap - width
        : Math.max(0, Math.min(containerWidth - width, x - width / 2));
  return (
    <div ref={ref} className="fx-viz-tooltip" role="presentation" style={{ left, top: y }}>
      <p className="fx-viz-tooltip-title">{title}</p>
      <ul className="grid gap-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2">
            <span
              className={cn("flex-none", row.mark === "box" ? "h-2.5 w-2.5 rounded-[3px]" : "h-[3px] w-3 rounded-full")}
              style={{ background: row.color }}
              aria-hidden="true"
            />
            <span className="fx-viz-tooltip-value">{row.value}</span>
            <span className="fx-viz-tooltip-label">{row.label}</span>
          </li>
        ))}
      </ul>
      {footer ? <p className="fx-viz-tooltip-footer">{footer}</p> : null}
    </div>
  );
}

/** Legend entry: a line key for line series, a box for bars / areas. */
export function LegendKey({ color, label, mark = "line" }: { color: string; label: string; mark?: "line" | "box" }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] fx-muted">
      <span
        className={mark === "box" ? "h-2.5 w-2.5 rounded-[3px]" : "h-[3px] w-3.5 rounded-full"}
        style={{ background: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/** Arrow keys move a highlighted index (keyboard twin of hover). */
export function stepIndex(key: string, current: number | null, count: number) {
  if (key === "ArrowRight") return current === null ? 0 : Math.min(count - 1, current + 1);
  if (key === "ArrowLeft") return current === null ? count - 1 : Math.max(0, current - 1);
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return undefined;
}
