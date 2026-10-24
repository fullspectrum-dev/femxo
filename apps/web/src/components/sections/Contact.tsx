import { House, MapPin, Phone, Users } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { CONTACT } from "@/lib/constants";

const DETAILS = [
  { icon: Users, label: "Management and directors", value: CONTACT.directors },
  { icon: House, label: "Registered address", value: CONTACT.registeredAddress },
  { icon: MapPin, label: "Corporate office", value: CONTACT.corporateOffice },
] as const;

export function Contact() {
  return (
    <section id="contact" className="ink band-ink relative scroll-mt-16 overflow-hidden py-20 sm:py-28">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(60%_70%_at_20%_50%,black,transparent)]" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-[clamp(2.4rem,7vw,4rem)] font-bold leading-[1.02] tracking-tight text-foreground [text-shadow:0_4px_0_rgba(90,30,140,0.55)]">
              One connected ecosystem.{" "}
              <span className="text-gold">More empowered local businesses.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Dealers, partners and entrepreneurs - talk to us about joining the Femxo network
              in your district.
            </p>
            <a href={CONTACT.phoneHref} className="btn-gold mt-8">
              <Phone size={17} aria-hidden="true" />
              Call {CONTACT.phone}
            </a>
          </div>

          <ul className="space-y-3">
            {DETAILS.map(({ icon: Icon, label, value }) => (
              <li key={label} className="card-glass flex gap-4 rounded-2xl p-5">
                <span className="icon-tile">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-1 font-display text-sm font-semibold leading-relaxed text-foreground sm:text-base">
                    {value}
                  </p>
                </div>
              </li>
            ))}
            <li>
              <a
                href={CONTACT.phoneHref}
                className="flex gap-4 rounded-2xl border border-gold-400/30 bg-gradient-to-r from-brand-800/60 to-brand-900/40 p-5 transition-colors hover:border-gold-400/60"
              >
                <span className="icon-tile-gold">
                  <Phone size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Phone</p>
                  <p className="mt-0.5 font-display text-xl font-bold text-gold">{CONTACT.phone}</p>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
