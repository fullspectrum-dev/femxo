import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PRICING } from "@/lib/constants";

export function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-background">
      <Container>
        <SectionHeading
          eyebrow="Straightforward plans"
          title="Choose a plan that fits your network"
          subtitle="Start with the essentials and move up as your distribution business grows."
        />

        <div className="mx-auto mt-12 grid max-w-6xl items-stretch gap-5 lg:grid-cols-3">
          {PRICING.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex h-full flex-col rounded-2xl border p-6 sm:p-8 ${
                plan.highlighted
                  ? "border-brand-500 bg-brand-50/70 shadow-xl shadow-brand-500/10 dark:border-brand-700 dark:bg-brand-950/40"
                  : "border-border/70 bg-card"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-foreground">
                {plan.name}
              </h3>
              <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-6 flex min-h-14 items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-foreground">
                  Coming soon
                </span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 border-t border-border/70 pt-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="#faq"
                className={`mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  plan.highlighted
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-border bg-background text-foreground hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/50"
                }`}
              >
                {plan.cta}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Contact our team to discuss plan availability and onboarding.
        </p>
      </Container>
    </section>
  );
}