import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./viz/Sparkline";

export interface StatDelta {
  /** "+11.9%", "+312". */
  text: string;
  direction: "up" | "down" | "flat";
  /** Whether this change is good news: colour = direction × good, never sign alone. */
  good: boolean;
}

/**
 * KPI tile: label, value, a change pill against a named period, a line of
 * context, and an optional 12-point sparkline. The value uses proportional
 * figures (tabular digits look loose at this size).
 */
export function StatCard({
  label,
  value,
  delta,
  deltaSuffix,
  context,
  trend,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  delta?: StatDelta;
  deltaSuffix?: string;
  context?: string;
  trend?: readonly number[];
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  className?: string;
}) {
  const Arrow = delta?.direction === "up" ? ArrowUpRight : delta?.direction === "down" ? ArrowDownRight : Minus;
  return (
    <article className={cn("fx-card fx-stat", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium fx-muted">{label}</p>
        {Icon ? <Icon size={16} strokeWidth={1.8} className="flex-none fx-muted" /> : null}
      </div>
      <p className="fx-stat-value">{value}</p>
      {delta ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
          <span className={cn("fx-delta", delta.direction === "flat" ? "fx-delta--flat" : delta.good ? "fx-delta--good" : "fx-delta--bad")}>
            <Arrow size={13} strokeWidth={2.4} aria-hidden="true" />
            {delta.text}
          </span>
          {deltaSuffix ? <span className="fx-muted">{deltaSuffix}</span> : null}
        </p>
      ) : null}
      {trend ? (
        <div className="mt-auto pt-3">
          <Sparkline values={trend} />
        </div>
      ) : null}
      {context ? <p className="mt-2 truncate text-[12px] fx-muted">{context}</p> : null}
    </article>
  );
}
