import {
  ArrowRight,
  BarChart3,
  Bot,
  Cloud,
  Code,
  Cpu,
  Database,
  Headset,
  Layers,
  Lightbulb,
  Phone,
  Rocket,
  Smartphone,
  Wrench,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { CONTACT } from "@/lib/constants";
import { ProcessSteps } from "./ProcessSteps";
import { cn } from "@/lib/utils";

// The eight services from the Femxo pitch, grouped by what they do for a business.
const PILLARS = [
  {
    icon: Layers,
    label: "Build",
    title: "Get your business online",
    services: [
      { icon: Code, name: "Web development", description: "Fast, secure websites and web platforms" },
      { icon: Smartphone, name: "App development", description: "Android and iOS apps for you and your customers" },
      { icon: Database, name: "ERP and business software", description: "Orders, inventory, billing and reports in one system" },
    ],
  },
  {
    icon: Cpu,
    label: "Intelligence",
    title: "Put AI to work",
    featured: true,
    services: [
      { icon: Lightbulb, name: "AI integration", description: "Add AI to the products and tools you already use" },
      { icon: Bot, name: "Agentic AI and automation", description: "Agents that plan, act and handle routine work" },
      { icon: BarChart3, name: "Data and analytics", description: "Dashboards and insights from your business data" },
    ],
  },
  {
    icon: Wrench,
    label: "Run",
    title: "Keep it running",
    services: [
      { icon: Cloud, name: "Cloud and infrastructure", description: "Hosting, security, networks and DevOps set-up" },
      { icon: Headset, name: "Support and maintenance", description: "Upgrades, monitoring and a help desk" },
    ],
  },
] as const;

const PROCESS = ["Understand", "Design", "Build", "Launch", "Support"] as const;

export function FemxoTech() {
  return (
    <section
      id="tech"
      className="ink band-ink relative scroll-mt-16 overflow-hidden py-20 sm:py-24"
      aria-labelledby="tech-heading"
    >
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-40" />
      <div
        aria-hidden="true"
        className="absolute -right-32 top-10 size-[28rem] rounded-full bg-brand-500/20 blur-3xl"
      />

      <Container className="relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Femxo Tech</p>
            <h2
              id="tech-heading"
              className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              Technology that takes businesses <span className="text-gold">digital</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              The technology arm of Femxo Consultancy Services Private Limited. We build for businesses
              in the Femxo network and beyond.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href="#contact" className="btn-gold">
              Discuss a project <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a href={CONTACT.phoneHref} className="btn-outline">
              <Phone size={16} aria-hidden="true" /> {CONTACT.phone}
            </a>
          </div>
        </div>

        {/* Services, in three pillars */}
        <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const featured = "featured" in pillar && pillar.featured;
            return (
              <article
                key={pillar.label}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-7",
                  featured
                    ? "band-plum shadow-[0_6px_0_0_#3a1250,0_30px_60px_-30px_rgba(164,83,194,0.8)]"
                    : "card-glass"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={featured ? "icon-tile-gold" : "icon-tile"}>
                    <pillar.icon size={18} aria-hidden="true" />
                  </span>
                  <h3 className="min-w-0 flex-1 font-display text-lg font-bold leading-tight text-foreground sm:hidden">
                    {pillar.title}
                  </h3>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                      featured ? "bg-white/15 text-gold-200" : "bg-secondary text-highlight"
                    )}
                  >
                    {pillar.label}
                  </span>
                </div>
                <h3 className="mt-5 hidden font-display text-2xl font-bold text-foreground sm:block">{pillar.title}</h3>

                <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
                  {pillar.services.map((service) => (
                    <li
                      key={service.name}
                      className={cn(
                        "flex gap-3 rounded-2xl border p-3 transition-colors sm:p-3.5",
                        featured
                          ? "border-white/15 bg-white/10 group-hover:bg-white/[0.13]"
                          : "border-foreground/10 bg-background/40"
                      )}
                    >
                      <service.icon
                        size={18}
                        aria-hidden="true"
                        className={cn("mt-0.5 shrink-0", featured ? "text-gold-300" : "text-highlight")}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{service.name}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{service.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* How a project runs */}
        <div className="card-glass mt-4 rounded-3xl p-5 sm:p-7">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Rocket size={14} aria-hidden="true" className="text-gold" /> How a project runs
          </p>
          <ProcessSteps steps={PROCESS} />
        </div>
      </Container>
    </section>
  );
}
