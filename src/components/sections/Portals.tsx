import { BarChart3, ShoppingBag, Store, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PORTALS } from "@/lib/constants";

const PORTAL_ICONS: Record<(typeof PORTALS)[number]["id"], LucideIcon> = {
  "super-admin": BarChart3,
  dealer: Truck,
  "sub-dealer": Store,
  customer: ShoppingBag,
};

export function Portals() {
  return (
    <section id="portals" className="section-padding bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="Purpose-built portals"
          title="The right view for every role"
          subtitle="Each person gets the tools they need, while your business stays connected end to end."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PORTALS.map((portal) => {
            const Icon = PORTAL_ICONS[portal.id];

            return (
              <article
                key={portal.id}
                className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  {portal.label}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-foreground">
                  {portal.title}
                </h3>
                <ul className="mt-5 space-y-3 border-t border-border/70 pt-5">
                  {portal.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}