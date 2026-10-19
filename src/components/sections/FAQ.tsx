import { ChevronDown } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FAQS } from "@/lib/constants";

export function FAQ() {
  return (
    <section id="faq" className="section-padding bg-muted/30">
      <Container size="narrow">
        <SectionHeading
          eyebrow="FAQ"
          title="Aapke sawaal, hamare jawab"
          subtitle="Everything you need to know about FEMXO ERP."
        />

        <div className="mt-8 w-full sm:mt-12">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              name="femxo-faq"
              className="group border-b border-border"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-5 text-left text-sm font-semibold hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:py-6 sm:text-base [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}