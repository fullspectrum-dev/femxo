import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Code2, HeartHandshake, MapPin, Phone } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Careers",
  description: "Help Femxo bring Bihar's local businesses online - careers in technology, distribution and support.",
};

const TEAMS = [
  {
    icon: Code2,
    title: "Femxo Tech",
    description: "Build the ERP, apps and AI tools that dealers and shop owners use every day.",
  },
  {
    icon: Boxes,
    title: "Distribution and operations",
    description: "Grow the dealer and sub-dealer network, district by district.",
  },
  {
    icon: HeartHandshake,
    title: "Onboarding and support",
    description: "Help entrepreneurs - especially women in towns and villages - get started with digital tools.",
  },
];

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="ink band-ink relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pt-40">
          <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-50" />
          <Container className="relative">
            <p className="eyebrow">Careers at Femxo</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Help Bihar&rsquo;s local businesses <span className="text-gold">go digital.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We&rsquo;re a Raxaul-based team connecting commerce, distribution and technology across
              Bihar&rsquo;s 38 districts.
            </p>
            <Link href="#open-roles" className="btn-gold mt-8">
              View open roles <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Container>
        </section>

        <section className="section-padding">
          <Container>
            <SectionHeading
              eyebrow="Where you can make an impact"
              title="Work that reaches every village"
              subtitle="From the software behind daily operations to the people who help businesses adopt it."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {TEAMS.map(({ icon: Icon, title, description }) => (
                <article key={title} className="card-raised rounded-3xl p-6">
                  <span className="icon-tile">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="open-roles" className="section-padding scroll-mt-16 pt-0 sm:pt-0 lg:pt-0">
          <Container size="narrow">
            <div className="card-raised rounded-3xl p-7 text-center sm:p-10">
              <span className="icon-tile-gold mx-auto">
                <MapPin size={18} aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Open positions
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
                No roles are listed right now. If you&rsquo;d like to work with us, call and tell us about
                yourself.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a href={CONTACT.phoneHref} className="btn-gold">
                  <Phone size={16} aria-hidden="true" /> Call {CONTACT.phone}
                </a>
                <Link href="/#why" className="btn-outline">
                  About Femxo <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
