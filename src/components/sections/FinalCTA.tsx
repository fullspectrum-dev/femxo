import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";

export function FinalCTA() {
  return (
    <section id="contact" className="relative overflow-hidden bg-gradient-hero py-20 lg:py-28">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-32 size-96 rounded-full bg-accent/20 blur-3xl"
      />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready to grow your business?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-brand-100 sm:text-lg">
          Join 10,000+ dealers who trust FEMXO ERP. Start free — no credit card
          required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="#pricing"
            className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent px-8 py-2 text-sm font-medium text-brand-900 shadow-glow-lime transition-colors outline-none hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
          >
            Start Free Trial
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#faq"
            className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/30 bg-white/5 px-8 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
          >
            Read FAQs
          </Link>
        </div>
        <p className="mt-6 text-xs text-brand-100">
          ✓ 14-day free trial · ✓ No credit card · ✓ Cancel anytime
        </p>
      </Container>
    </section>
  );
}