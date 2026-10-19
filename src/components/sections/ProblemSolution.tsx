import { ArrowRight, CircleCheck, CircleX } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";

const CHALLENGES = [
  "Stock, orders, and ledgers scattered across spreadsheets",
  "Manual commission calculations that are hard to verify",
  "Disconnected dealer, sub-dealer, and customer workflows",
];

const OUTCOMES = [
  "One live view of inventory, orders, and settlements",
  "Clear, rules-based commissions with an audit trail",
  "Connected portals for every level of your network",
];

export function ProblemSolution() {
  return (
    <section className="section-padding bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="One connected platform"
          title="Less chasing. More growing."
          subtitle="Replace disconnected tools with one shared view of your distribution business."
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <div className="h-full rounded-2xl border border-border/70 bg-background p-6 sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CircleX aria-hidden="true" className="size-4" />
              Before FEMXO
            </div>
            <ul className="space-y-4">
              {CHALLENGES.map((challenge) => (
                <li
                  key={challenge}
                  className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <CircleX
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground/60"
                  />
                  {challenge}
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden="true"
            className="mx-auto flex size-10 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
          >
            <ArrowRight className="size-5 md:rotate-0 rotate-90" />
          </div>

          <div className="h-full rounded-2xl border border-brand-300/60 bg-brand-50/70 p-6 shadow-lg shadow-brand-500/5 dark:border-brand-800 dark:bg-brand-950/40 sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800 dark:bg-brand-900 dark:text-brand-200">
              <CircleCheck aria-hidden="true" className="size-4" />
              With FEMXO
            </div>
            <ul className="space-y-4">
              {OUTCOMES.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
                >
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300"
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}