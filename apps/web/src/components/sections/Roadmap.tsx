"use client";

import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StepTrack, useStepCycle } from "@/components/shared/StepFlow";
import { cn } from "@/lib/utils";

const PHASES = [
  { title: "Prepare", description: "Finalise product scope, processes, partner model and pilot needs" },
  { title: "Pilot", description: "Test distribution, e-commerce and ERP with an initial group of businesses" },
  { title: "Learn and improve", description: "Collect feedback, improve onboarding and document repeatable processes" },
  { title: "Expand", description: "Grow across districts and local areas based on validated demand and capacity" },
] as const;

export function Roadmap() {
  const { ref, target, reached, instant } = useStepCycle<HTMLOListElement>(PHASES.length);

  return (
    <section id="roadmap" className="section-padding scroll-mt-16">
      <Container>
        <SectionHeading
          eyebrow="Execution roadmap"
          title="A phased plan to validate, launch and scale"
          subtitle="We grow district by district through local partners - only where demand is proven."
        />

        <ol ref={ref} className="relative mt-12 grid gap-4 md:grid-cols-4">
          {/* From the centre of the first marker (22px in) to the centre of the
              last one: four columns with 16px gaps put it 25% - 34px from the right. */}
          <StepTrack
            count={PHASES.length}
            target={target}
            reached={reached}
            instant={instant}
            className="left-[22px] right-[calc(25%-34px)] top-[21px] hidden md:block"
          />
          {PHASES.map((phase, i) => {
            const isLit = i <= reached;
            const isCurrent = i === reached;
            return (
              <li key={phase.title} className="relative">
                <span
                  className={cn(
                    "relative z-10 flex size-11 items-center justify-center rounded-full font-display text-sm font-bold transition-all duration-500",
                    isCurrent
                      ? "scale-110 bg-gold-400 text-ink shadow-[0_8px_24px_-6px_rgba(255,198,92,0.7)]"
                      : isLit
                        ? "border border-gold-400 bg-card text-gold"
                        : "border border-border bg-card text-muted-foreground"
                  )}
                >
                  0{i + 1}
                </span>
                <div
                  className={cn(
                    "card-raised mt-4 h-[calc(100%-3.75rem)] rounded-2xl p-5 transition-[border-color,transform] duration-500",
                    isCurrent && "-translate-y-1 border-gold-400/70"
                  )}
                >
                  <h3 className="font-display text-lg font-bold text-foreground">{phase.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{phase.description}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-sm font-semibold text-gold">
          The target of 1,00,000 businesses is a long-term ambition, not a claim of current customers.
        </p>
      </Container>
    </section>
  );
}
