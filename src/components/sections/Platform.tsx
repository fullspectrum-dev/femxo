import Image from "next/image";
import {
  Bot,
  Database,
  Globe,
  GraduationCap,
  Lightbulb,
  Play,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";

const PILLARS = [
  { icon: Globe, title: "Online storefront", description: "Own catalogue and product listings" },
  { icon: Database, title: "Orders, stock, billing", description: "ERP built for small business" },
  { icon: Bot, title: "AI assistant", description: "Marketing, replies and reminders in Hindi and English", gold: true },
  { icon: GraduationCap, title: "Training and support", description: "Onboarding and guidance close to home" },
] as const;

const AGENT_STEPS = [
  { icon: Zap, title: "Trigger", description: "A new order, low stock or a customer message arrives" },
  { icon: Lightbulb, title: "Agent decides", description: "Reads the data and picks the next best step" },
  { icon: Play, title: "Takes action", description: "Updates the ERP, drafts invoices, sends replies" },
  { icon: ShieldCheck, title: "Owner approves", description: "Key decisions always wait for a person" },
] as const;

export function Platform() {
  return (
    <section id="platform" className="section-padding scroll-mt-16">
      <Container>
        <SectionHeading
          eyebrow="Digital backbone"
          title="A strong digital system behind every entrepreneur"
          subtitle="Dealers, sub-dealers and shop owners all work in the same system - so an order placed in a village shows up everywhere it should, instantly."
        />

        {/* Hub: the system in the middle, what it gives people around it */}
        <div className="mt-12 grid gap-4 md:grid-cols-[1fr_1.1fr_1fr] md:items-stretch">
          <div className="grid gap-4">
            {PILLARS.slice(0, 2).map((pillar) => (
              <Pillar key={pillar.title} {...pillar} />
            ))}
          </div>
          <div className="ink band-plum relative flex flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-10 text-center shadow-[0_6px_0_0_#3a1250,0_30px_60px_-30px_rgba(120,40,160,0.8)] md:order-none">
            <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-40" />
            <span className="relative flex size-20 items-center justify-center rounded-full border border-white/25 bg-white/10">
              <Image src="/images/femxo-mark-white.png" alt="" width={390} height={570} className="h-10 w-auto" />
            </span>
            <h3 className="relative mt-5 font-display text-2xl font-bold text-white">Femxo Digital System</h3>
            <p className="relative mt-2 max-w-xs text-sm text-white/80">
              One system for dealers, sub-dealers and entrepreneurs.
            </p>
          </div>
          <div className="grid gap-4">
            {PILLARS.slice(2).map((pillar) => (
              <Pillar key={pillar.title} {...pillar} />
            ))}
          </div>
        </div>

        {/* AI agents */}
        <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">Practical AI</p>
            <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              AI agents do the routine work. <span className="text-gold">You stay in control.</span>
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Faster sales, smarter stock and simpler customer service - without
              handing your business over to a machine.
            </p>
          </div>

          <div>
            <ol className="grid gap-3 sm:grid-cols-4">
              {AGENT_STEPS.map(({ icon: Icon, title, description }, i) => (
                <li key={title} className="relative">
                  {i < AGENT_STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="dots-x is-live absolute left-[calc(100%-4px)] top-[34px] z-10 hidden h-0.5 w-5 sm:block"
                    />
                  )}
                  <div
                    className={
                      i === AGENT_STEPS.length - 1
                        ? "ink band-plum h-full rounded-2xl p-4 text-white shadow-[0_4px_0_0_#3a1250]"
                        : "card-raised h-full rounded-2xl p-4"
                    }
                  >
                    <span className={i === AGENT_STEPS.length - 1 ? "icon-tile-gold" : "icon-tile"}>
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <p className="mt-3 font-display text-sm font-bold text-foreground">
                      {i + 1}. {title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 flex gap-3 rounded-2xl border border-border bg-secondary/60 p-4 text-sm leading-relaxed text-foreground/90">
              <span className="h-fit shrink-0 self-start rounded-full bg-gold-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                Example
              </span>
              A dealer&rsquo;s stock falls below the set limit. The agent checks recent sales,
              drafts a reorder and sends it to the owner for approval.
            </p>
          </div>
        </div>

      </Container>
    </section>
  );
}

function Pillar({
  icon: Icon,
  title,
  description,
  gold,
}: {
  icon: typeof Globe;
  title: string;
  description: string;
  gold?: boolean;
}) {
  return (
    <div className="card-raised flex items-start gap-4 rounded-2xl p-5">
      <span className={gold ? "icon-tile-gold" : "icon-tile"}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
