import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import {
  AtSign,
  BriefcaseBusiness,
  Camera,
  CirclePlay,
  UsersRound,
} from "lucide-react";
import { Container } from "@/components/shared/Container";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Portals", href: "#portals" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
  ],
  Company: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Our Network", href: "#portals" },
    { label: "Customer Stories", href: "#testimonials" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "#contact" },
  ],
  Support: [
    { label: "Help Center", href: "#faq" },
    { label: "Integrations", href: "#integrations" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQs", href: "#faq" },
  ],
};

const SOCIALS = [
  { icon: AtSign, href: "https://twitter.com", label: "Twitter" },
  { icon: BriefcaseBusiness, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Camera, href: "https://instagram.com", label: "Instagram" },
  { icon: UsersRound, href: "https://facebook.com", label: "Facebook" },
  { icon: CirclePlay, href: "https://youtube.com", label: "YouTube" },
];

// Only the year needs request time; keeping it in its own Suspense boundary
// lets the rest of the footer stay in the prerendered shell.
async function CurrentYear() {
  await connection();
  return new Date().getFullYear();
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="mb-4 inline-flex w-fit items-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5"
              aria-label="Femxo Consultancy Services home"
            >
              <Image
                src="/images/femxo-consultancy-logo.png"
                alt="Femxo Consultancy Services"
                width={737}
                height={339}
                sizes="132px"
                className="h-14 w-[132px] object-contain"
              />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              India&apos;s modern ERP platform for dealers, sub-dealers, and
              customers. Built for scale, designed for simplicity.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={
                        link.href.startsWith("#") ? `/${link.href}` : link.href
                      }
                      className="text-sm text-muted-foreground transition-colors hover:text-brand-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            ©{" "}
            <Suspense fallback={null}>
              <CurrentYear />
            </Suspense>{" "}
            Femxo Consultancy Services Pvt. Ltd. All
            rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made in India 🇮🇳 · ISO 27001 Aligned · DPDP Compliant
          </p>
        </div>
      </Container>
    </footer>
  );
}