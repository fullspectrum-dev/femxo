import { Minus, Plus } from "lucide-react";
import { cn } from "../cn";
import { IconButton } from "./Button";

/**
 * − quantity + for a cart line. The buttons name the item ("Increase
 * quantity of Edible oil 1 L") so a list of them stays distinguishable for
 * screen readers; the new quantity is announced.
 */
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  busy = false,
  itemName,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  /** While a change is saving, both buttons wait. */
  busy?: boolean;
  itemName: string;
  className?: string;
}) {
  const atMax = max !== undefined && value >= max;
  return (
    <div className={cn("inline-flex flex-col items-start gap-1", className)}>
      <div className="inline-flex items-center rounded-control border border-line-input bg-surface">
        <IconButton
          label={`Decrease quantity of ${itemName}`}
          icon={<Minus size={16} aria-hidden="true" />}
          disabled={busy || value <= min}
          onClick={() => onChange(value - 1)}
          className="rounded-r-none"
        />
        <output aria-live="polite" className="min-w-9 text-center text-[15px] font-semibold tabular-nums">
          {value}
        </output>
        <IconButton
          label={`Increase quantity of ${itemName}`}
          icon={<Plus size={16} aria-hidden="true" />}
          disabled={busy || atMax}
          onClick={() => onChange(value + 1)}
          className="rounded-l-none"
        />
      </div>
      {atMax ? <p className="text-xs text-ink-muted">Max {max} per order</p> : null}
    </div>
  );
}
