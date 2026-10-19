import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Code2,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/shared/Container";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Explore career opportunities at FEMXO and help build tools for India's distribution networks.",
};

const TEAMS = [
  {
    icon: Code2,
    title: "Product & engineering",
    description:
      "Build reliable software for inventory, orders, payments, and business operations.",
  },
  {
    icon: Boxes,
    title: "Distribution & operations",
    description:
      "Help connect dealers, sub-dealers, retail partners, and customers through better workflows.",
  },
  {
    icon: HeartHandshake,
    title: "Customer success",
    description:
      "Support businesses as they bring their day-to-day operations onto FEMXO ERP.",
  },
];

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-hero pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-44">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl"
          />
          <Container className="relative">
            <Link
              href="/"
              className="text-sm font-medium text-brand-100 transition-colors hover:text-white"
            >
              Home <span aria-hidden="true">/</span> Careers
            </Link>
            <div className="mt-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-200">
                Careers at FEMXO
              </p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Build tools that help businesses move forward.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-100 sm:text-lg">
                FEMXO ERP brings dealers, sub-dealers, retail partners, and
                customers onto one platform. Explore the teams behind the
                product and check this page for opportunities.
              </p>
              <Link
                href="#open-roles"
                className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg transition-colors hover:bg-brand-50"
              >
                View open roles <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </Container>
        </section>

        <section className="section-padding">
          <Container>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
                Where you can make an impact
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Work on real business challenges
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                From the software powering daily operations to the people
                helping businesses adopt it, our work spans the full
                distribution journey.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {TEAMS.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="open-roles" className="section-padding bg-muted/40">
          <Container size="narrow">
            <div className="rounded-3xl border border-border/70 bg-card p-7 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                <MapPin size={22} aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Open positions
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
                There are no open roles listed right now. Please check back for
                future opportunities.
              </p>
              <Link
                href="/#features"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Explore FEMXO ERP <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}
