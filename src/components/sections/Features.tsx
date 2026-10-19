import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FEATURES } from "@/lib/constants";

const FEATURE_ICONS: Record<(typeof FEATURES)[number]["icon"], LucideIcon> = {
  Package: Icons.Package,
  Wallet: Icons.Wallet,
  Receipt: Icons.Receipt,
  Users: Icons.Users,
  TrendingUp: Icons.TrendingUp,
  Sparkles: Icons.Sparkles,
};

export function Features() {
  return (
    <section id="features" className="section-padding bg-background">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything your business needs"
          subtitle="From inventory to commissions, GST billing to settlements — all in one platform."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon];
            return (
              <article
                key={feature.title}
                className="group relative rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 transition-colors group-hover:from-brand-500 group-hover:to-brand-700 group-hover:text-white">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}