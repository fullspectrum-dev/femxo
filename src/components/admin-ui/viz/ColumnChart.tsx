"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { ChartTooltip, labelIndices, niceTicks, stepIndex, useElementWidth } from "./shared";

const MARGIN = { top: 22, right: 6, bottom: 30 };
const RADIUS = 4;

/** A column with a 4px rounded data-end and a square foot on the baseline. */
function columnPath(x: number, y: number, width: number, baseline: number) {
  const r = Math.min(RADIUS, width / 2, Math.max(0, baseline - y));
  return `M${x},${baseline}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${baseline}Z`;
}

/**
 * Columns over time, one series. The latest bucket is the accent (emphasis
 * form) and carries the only value label; every column has a hover / focus
 * tooltip, and its hit area is the whole slot, not just the painted column.
 */
export function ColumnChart({
  labels,
  values,
  seriesLabel,
  formatValue,
  formatTick,
  height = 220,
  label,
}: {
  labels: readonly { axis: string; full: string }[];
  values: readonly number[];
  seriesLabel: string;
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  height?: number;
  label: string;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const count = values.length;
  const ticks = niceTicks(Math.max(...values), 3);
  const top = ticks.at(-1)!;
  const left = Math.max(...ticks.map((tick) => formatTick(tick).length)) * 6.6 + 12;
  const innerWidth = Math.max(0, width - left - MARGIN.right);
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const baseline = MARGIN.top + innerHeight;
  const slot = innerWidth / Math.max(1, count);
  // Thin columns: never more than 24px, and air between neighbours.
  const columnWidth = Math.max(2, Math.min(24, slot * 0.62));
  const y = (value: number) => MARGIN.top + innerHeight * (1 - value / top);
  const cx = (index: number) => left + slot * index + slot / 2;
  const shown = labelIndices(count, Math.max(2, Math.floor(innerWidth / 64)));
  const last = count - 1;

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
      aria-label={`${label} Use the left and right arrow keys to read each column.`}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
      onPointerLeave={() => setActive(null)}
    >
      {width > 0 ? (
        <svg width={width} height={height} aria-hidden="true" className="block overflow-visible">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} className="fx-viz-grid" shapeRendering="crispEdges" />
              <text x={left - 10} y={y(tick)} dy="0.32em" textAnchor="end" className="fx-viz-tick">
                {formatTick(tick)}
              </text>
            </g>
          ))}

          {values.map((value, index) => {
            const emphasised = index === last;
            const hovered = index === active;
            return (
              <g key={labels[index]!.full}>
                <path
                  d={columnPath(cx(index) - columnWidth / 2, y(value), columnWidth, baseline)}
                  className={emphasised ? "fx-viz-column fx-viz-column--accent" : "fx-viz-column"}
                  data-active={hovered || undefined}
                />
                {/* The whole slot is the hit target. */}
                <rect
                  x={left + slot * index}
                  y={MARGIN.top}
                  width={slot}
                  height={innerHeight}
                  fill="transparent"
                  onPointerEnter={() => setActive(index)}
                />
              </g>
            );
          })}

          <text x={cx(last)} y={y(values[last]!) - 7} textAnchor="middle" className="fx-viz-value">
            {formatTick(values[last]!)}
          </text>

          {labels.map((entry, index) =>
            shown.has(index) ? (
              <text key={entry.full} x={cx(index)} y={height - 8} textAnchor="middle" className="fx-viz-tick">
                {entry.axis}
              </text>
            ) : null
          )}
        </svg>
      ) : null}

      {active !== null ? (
        <ChartTooltip
          title={labels[active]!.full}
          x={cx(active)}
          y={Math.max(0, y(values[active]!) - 8)}
          containerWidth={width}
          rows={[
            {
              key: "value",
              label: seriesLabel,
              value: formatValue(values[active]!),
              color: active === last ? "var(--fx-viz-accent)" : "var(--fx-viz-muted)",
              mark: "box",
            },
          ]}
        />
      ) : null}
    </div>
  );
}
