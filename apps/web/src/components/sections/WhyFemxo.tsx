import { ArrowRight, Database, Globe, Link2, Users } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";

const PROBLEMS = [
  {
    icon: Link2,
    title: "Fragmented distribution",
    description: "Dealer and sub-dealer networks are hard to coordinate without shared processes.",
  },
  {
    icon: Globe,
    title: "Limited digital adoption",
    description: "Small businesses need practical, affordable support to move online.",
  },
  {
    icon: Database,
    title: "Operational complexity",
    description: "Orders, stock and billing sit in separate tools or paper records.",
  },
  {
    icon: Users,
    title: "Uneven access to support",
    description: "Smaller towns and villages have few nearby options for technology guidance.",
  },
] as const;

const ENGINES = [
  {
    label: "Engine 1",
    title: "E-commerce and Distribution",
    summary: "Connects businesses to markets.",
    points: [
      "Online commerce and product discovery",
      "Dealer and sub-dealer distribution network",
      "GST-registered and MSME business support",
      "Better coordination of orders and market access",
    ],
    className: "band-plum text-white",
    labelClass: "text-gold-300",
    mutedClass: "text-white/75",
  },
  {
    label: "Engine 2",
    title: "Femxo Tech",
    summary: "Helps them run and improve operations.",
    points: [
      "ERP for orders, inventory and billing",
      "Website and app development",
      "AI integration and agentic automation",
      "Cloud and infrastructure support",
    ],
    className: "card-raised",
    labelClass: "text-highlight",
    mutedClass: "text-muted-foreground",
  },
] as const;

export function WhyFemxo() {
  return (
    <section id="why" className="section-padding scroll-mt-16">
      <Container>
        <SectionHeading
          eyebrow="The problem → the Femxo answer"
          title={
            <>
              Two connected engines, one goal:{" "}
              <span className="text-gold">business growth</span>
            </>
          }
          subtitle="Local businesses need organised operations and digital access. Femxo solves both sides at once."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_auto_1.3fr] lg:items-stretch">
          {/* The gap */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              What holds businesses back
            </p>
            <ul className="space-y-3">
              {PROBLEMS.map(({ icon: Icon, title, description }) => (
                <li key={title} className="card-raised flex gap-4 rounded-2xl p-4">
                  <span className="icon-tile">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center" aria-hidden="true">
            <span className="flex size-12 rotate-90 items-center justify-center rounded-full border border-border bg-card text-highlight shadow-sm lg:rotate-0">
              <ArrowRight size={20} />
            </span>
          </div>

          {/* The answer */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              How Femxo fixes it
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {ENGINES.map((engine) => (
                <article key={engine.title} className={`flex flex-col rounded-3xl p-6 sm:p-7 ${engine.className}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${engine.labelClass}`}>
                    {engine.label}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">
                    {engine.title}
                  </h3>
                  <p className={`mt-2 text-sm ${engine.mutedClass}`}>{engine.summary}</p>
                  <ul className="mt-6 space-y-3 border-t border-current/15 pt-5">
                    {engine.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-sm leading-relaxed">
                        <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
