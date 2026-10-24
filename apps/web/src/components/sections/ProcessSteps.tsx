"use client";

import { StepTrack, useStepCycle } from "@/components/shared/StepFlow";
import { cn } from "@/lib/utils";

/** "How a project runs" in the Femxo Tech section. */
export function ProcessSteps({ steps }: { steps: readonly string[] }) {
  const { ref, target, reached, instant } = useStepCycle<HTMLOListElement>(steps.length);

  return (
    <ol ref={ref} className="relative mt-5 grid text-center" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
      {/* Markers sit in the middle of equal columns, so the ends are half a column in. */}
      <StepTrack
        count={steps.length}
        target={target}
        reached={reached}
        instant={instant}
        className="top-[11px]"
        style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%` }}
      />
      {steps.map((step, i) => {
        const isLit = i <= reached;
        const isCurrent = i === reached;
        return (
          <li key={step} className="relative flex flex-col items-center gap-2">
            <span
              className={cn(
                "relative z-10 flex size-6 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-500",
                isCurrent
                  ? "scale-110 bg-gold-400 text-ink shadow-[0_0_16px_2px_rgba(255,198,92,0.55)]"
                  : isLit
                    ? "border border-gold-400 bg-background text-gold"
                    : "border border-foreground/20 bg-background text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-[11px] font-semibold transition-colors duration-500 sm:text-xs",
                isLit ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
