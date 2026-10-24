import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepState = "done" | "current" | "upcoming" | "failed";

export interface TimelineStep {
  label: string;
  state: StepState;
  /** "12 Oct 2026", "Current step", "Upcoming". */
  meta?: string;
}

/** Foundations "Approval timeline": numbered steps, done ones ticked. */
export function Timeline({ steps, label }: { steps: readonly TimelineStep[]; label: string }) {
  return (
    <ol className="fx-timeline" aria-label={label}>
      {steps.map((step, index) => (
        <li key={step.label} aria-current={step.state === "current" ? "step" : undefined}>
          <span className={cn("fx-step", step.state !== "upcoming" && `fx-step--${step.state}`)} aria-hidden="true">
            {step.state === "done" ? <Check size={14} strokeWidth={3} /> : step.state === "failed" ? <X size={14} strokeWidth={3} /> : index + 1}
          </span>
          <div>
            <p className="text-[13.5px] font-semibold">{step.label}</p>
            <p className="fx-helper">{step.meta ?? defaultMeta(step.state)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function defaultMeta(state: StepState) {
  if (state === "current") return "Current step";
  if (state === "upcoming") return "Upcoming";
  if (state === "failed") return "Stopped";
  return "Done";
}
