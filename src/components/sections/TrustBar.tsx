import { Container } from "@/components/shared/Container";
import { INTEGRATIONS } from "@/lib/constants";

export function TrustBar() {
  return (
    <section id="integrations" className="border-y border-border/50 bg-muted/30 py-8">
      <Container>
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Trusted integrations with India&apos;s leading platforms
        </p>
        <div className="marquee-mask relative overflow-hidden">
          <div className="flex animate-marquee gap-12">
            {[...INTEGRATIONS, ...INTEGRATIONS].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex shrink-0 items-center gap-2 text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <div className="h-2 w-2 rounded-full bg-brand-500" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}