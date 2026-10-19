import { Quote, Star } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TESTIMONIALS } from "@/lib/constants";

export function Testimonials() {
  return (
    <section id="testimonials" className="section-padding bg-muted/30">
      <Container>
        <SectionHeading
          eyebrow="From the network"
          title="Built around the people who keep business moving"
          subtitle="Hear how dealers and partners describe the day-to-day difference."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 sm:p-7"
            >
              <div
                className="flex gap-1 text-amber-500"
                aria-label={`${testimonial.rating} out of 5 stars`}
                role="img"
              >
                {Array.from({ length: testimonial.rating }, (_, index) => (
                  <Star
                    key={index}
                    aria-hidden="true"
                    className="size-4 fill-current"
                  />
                ))}
              </div>
              <Quote
                aria-hidden="true"
                className="mt-5 size-6 text-brand-300 dark:text-brand-700"
              />
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground sm:text-base">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border/70 pt-4">
                <p className="font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {testimonial.role} · {testimonial.city}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}