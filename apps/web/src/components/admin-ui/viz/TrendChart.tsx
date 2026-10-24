"use client";

import { useId, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { ChartTooltip, labelIndices, niceTicks, stepIndex, useElementWidth } from "./shared";

export interface TrendSeries {
  key: string;
  label: string;
  values: readonly number[];
  /** "accent" is the series the story is about; "muted" is context (emphasis form). */
  tone: "accent" | "muted";
}

const COLOR = { accent: "var(--fx-viz-accent)", muted: "var(--fx-viz-muted)" } as const;
const MARGIN = { top: 12, right: 14, bottom: 30 };

/**
 * Line chart over time with a wash under the accent series. A crosshair
 * snaps to the nearest bucket and one tooltip lists every series there;
 * arrow keys do the same from the keyboard.
 */
export function TrendChart({
  labels,
  series,
  formatValue,
  formatTick,
  height = 260,
  label,
  tooltipFooter,
}: {
  labels: readonly { axis: string; full: string }[];
  series: readonly TrendSeries[];
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  height?: number;
  /** Screen-reader summary of what the chart shows. */
  label: string;
  tooltipFooter?: (index: number) => string | null;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId();
  const count = labels.length;

  const max = Math.max(...series.flatMap((entry) => entry.values));
  const ticks = niceTicks(max);
  const top = ticks.at(-1)!;
  const left = Math.max(...ticks.map((tick) => formatTick(tick).length)) * 6.6 + 14;
  const innerWidth = Math.max(0, width - left - MARGIN.right);
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const x = (index: number) => left + (count === 1 ? innerWidth / 2 : (index / (count - 1)) * innerWidth);
  const y = (value: number) => MARGIN.top + innerHeight * (1 - value / top);
  const path = (values: readonly number[]) => values.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join("");
  const accent = series.find((entry) => entry.tone === "accent");
  const shown = labelIndices(count, Math.max(2, Math.floor(innerWidth / 72)));

  function onPointerMove(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / Math.max(1, box.width);
    setActive(Math.max(0, Math.min(count - 1, Math.round(ratio * (count - 1)))));
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") return setActive(null);
    const next = stepIndex(event.key, active, count);
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
  }

  return (
    <div
      ref={ref}
      className="fx-viz relative"
      style={{ height }}
      tabIndex={0}
      role="group"
      aria-label={`${label} Use the left and right arrow keys to read each point.`}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
    >
      {width > 0 ? (
        <svg width={width} height={height} aria-hidden="true" className="block overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--fx-viz-accent)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--fx-viz-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} className="fx-viz-grid" shapeRendering="crispEdges" />
              <text x={left - 10} y={y(tick)} dy="0.32em" textAnchor="end" className="fx-viz-tick">
                {formatTick(tick)}
              </text>
            </g>
          ))}
          {labels.map((entry, index) =>
            shown.has(index) ? (
              <text
                key={entry.full}
                x={x(index)}
                y={height - 8}
                textAnchor={index === 0 && count > 1 ? "start" : index === count - 1 && count > 1 ? "end" : "middle"}
                className="fx-viz-tick"
              >
                {entry.axis}
              </text>
            ) : null
          )}

          {accent ? (
            <path
              d={`${path(accent.values)}L${x(count - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`}
              fill={`url(#${gradientId})`}
            />
          ) : null}
          {[...series]
            .sort((a, b) => (a.tone === b.tone ? 0 : a.tone === "muted" ? -1 : 1))
            .map((entry) => (
              <path
                key={entry.key}
                d={path(entry.values)}
                fill="none"
                stroke={COLOR[entry.tone]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

          {active === null && accent ? (
            <circle cx={x(count - 1)} cy={y(accent.values[count - 1]!)} r={4} fill={COLOR.accent} className="fx-viz-ring" />
          ) : null}

          {active !== null ? (
            <g>
              <line x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={y(0)} className="fx-viz-crosshair" shapeRendering="crispEdges" />
              {series.map((entry) => (
                <circle key={entry.key} cx={x(active)} cy={y(entry.values[active]!)} r={4.5} fill={COLOR[entry.tone]} className="fx-viz-ring" />
              ))}
            </g>
          ) : null}

          <rect
            x={left}
            y={MARGIN.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
      ) : null}

      {active !== null ? (
        <ChartTooltip
          title={labels[active]!.full}
          x={x(active)}
          y={MARGIN.top}
          containerWidth={width}
          // The series the chart is about leads the readout.
          rows={[...series].sort((a, b) => (a.tone === b.tone ? 0 : a.tone === "accent" ? -1 : 1)).map((entry) => ({
            key: entry.key,
            label: entry.label,
            value: formatValue(entry.values[active]!),
            color: COLOR[entry.tone],
          }))}
          footer={tooltipFooter?.(active) ?? undefined}
        />
      ) : null}
    </div>
  );
}
