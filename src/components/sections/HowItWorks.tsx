import { ArrowRight, ClipboardList, Network, Rocket } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";

const STEPS = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Set up your business",
    description:
      "Add your products, warehouses, pricing, and the rules your team already follows.",
  },
  {
    number: "02",
    icon: Network,
    title: "Connect your network",
    description:
      "Invite dealers and sub-dealers, assign territories, and give each role its own portal.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Run operations in sync",
    description:
      "Manage orders, stock, billing, commissions, and settlements from one connected workflow.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-background">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Up and running in three clear steps"
          subtitle="Bring your people and everyday operations onto one shared platform."
        />

        <ol className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ number, icon: Icon, title, description }, index) => (
            <li
              key={number}
              className="relative rounded-2xl border border-border/70 bg-card p-6 sm:p-8"
            >
              {index < STEPS.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="absolute -right-4 top-10 z-10 hidden size-7 rounded-full border border-border bg-background p-1 text-brand-600 md:block"
                />
              )}
              <div className="flex items-center justify-between">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <span className="font-display text-3xl font-bold text-brand-700 dark:text-brand-300">
                  {number}
                </span>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}