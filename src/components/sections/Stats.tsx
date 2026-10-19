import { Container } from "@/components/shared/Container";
import { STATS } from "@/lib/constants";

export function Stats() {
  return (
    <section id="stats" className="relative overflow-hidden bg-gradient-hero section-padding">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(199,244,100,0.22) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(108,53,165,0.32) 0%, transparent 40%)",
        }}
      />
      <Container className="relative">
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-8 xl:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 text-center"
            >
              <div className="whitespace-nowrap font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl xl:text-4xl 2xl:text-5xl">
                {"prefix" in stat ? stat.prefix : ""}
                {stat.value.toLocaleString("en-IN")}
                {stat.suffix}
              </div>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-brand-200 sm:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}