import { BarChart3, GraduationCap, Play, Users } from "lucide-react";
import { Container } from "@/components/shared/Container";

const SUPPORT = [
  { icon: Play, title: "Digital onboarding", description: "Simple guidance to begin using digital tools" },
  { icon: BarChart3, title: "Business enablement", description: "Access to e-commerce, distribution links and ERP" },
  { icon: GraduationCap, title: "Skills and confidence", description: "Practical training in digital business and online markets" },
  { icon: Users, title: "Local support network", description: "Help close to home, from people in the community" },
] as const;

export function Women() {
  return (
    <section id="women" className="ink band-plum relative scroll-mt-16 overflow-hidden py-20 sm:py-24">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-30" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow text-gold-300">Women empowerment</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Women at the centre of Bihar&rsquo;s digital growth
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              Femxo makes business support more accessible to women entrepreneurs in towns
              and villages, through our dealer network and digital system.
            </p>
            <a href="#contact" className="btn-gold mt-8">
              Special focus on women entrepreneurs
            </a>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {SUPPORT.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-[0_4px_0_0_rgba(40,8,60,0.6)] backdrop-blur-sm"
              >
                <span className="icon-tile-gold">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/75">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
