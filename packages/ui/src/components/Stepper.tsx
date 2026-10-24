import { Check } from "lucide-react";
import { cn } from "../cn";

/** Progress through ordered steps (checkout): done, current, upcoming. */
export function Stepper({
  steps,
  current,
  label,
  className,
}: {
  steps: readonly string[];
  /** Index of the current step. */
  current: number;
  label: string;
  className?: string;
}) {
  return (
    <ol aria-label={label} className={cn("flex items-center gap-2", className)}>
      {steps.map((step, index) => {
        const done = index < current;
        const isCurrent = index === current;
        return (
          <li key={step} aria-current={isCurrent ? "step" : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              aria-hidden="true"
              className={cn(
                "grid h-7 w-7 flex-none place-items-center rounded-full text-xs font-bold",
                done ? "bg-success text-on-primary" : isCurrent ? "bg-primary text-on-primary" : "bg-surface-sunken text-ink-muted"
              )}
            >
              {done ? <Check size={14} strokeWidth={3} /> : index + 1}
            </span>
            <span className={cn("text-sm", isCurrent ? "font-semibold text-ink" : "text-ink-muted")}>
              {step}
              {done ? <span className="sr-only">, completed</span> : null}
            </span>
            {index < steps.length - 1 ? <span aria-hidden="true" className={cn("h-0.5 flex-1 rounded-full", done ? "bg-success" : "bg-line")} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
