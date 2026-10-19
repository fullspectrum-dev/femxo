import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles, Star } from "lucide-react";
import { Container } from "@/components/shared/Container";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-hero pt-28 pb-20 sm:pt-32 lg:pt-40 lg:pb-28"
      aria-labelledby="hero-heading"
    >
      {/* Background Orbs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 top-0 hidden h-96 w-96 rounded-full bg-brand-500/30 blur-3xl sm:block" />
        <div className="absolute -right-40 bottom-0 hidden h-96 w-96 rounded-full bg-lime-400/20 blur-3xl sm:block" />
        <div className="absolute left-1/2 top-1/3 hidden h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/20 blur-3xl sm:block" />
      </div>

      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Container className="relative">
        <div className="grid min-w-0 items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column */}
          <div className="min-w-0 text-center lg:text-left">
            <div
              className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white sm:px-4 sm:text-sm sm:backdrop-blur-md"
            >
              <Sparkles size={14} className="text-lime-400" />
              <span>AI-powered ERP for India</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden text-brand-200 sm:inline">
                Trusted by 10,000+ dealers
              </span>
            </div>

            <h1
              id="hero-heading"
              className="font-display text-[clamp(2.25rem,9vw,3rem)] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              India ka{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-lime-400 to-lime-500 bg-clip-text text-transparent">
                  Naya
                </span>
              </span>{" "}
              Business ERP
            </h1>

            <p
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg lg:mx-0"
            >
              Dealers, sub-dealers, retail partners, aur customers — sab ek
              platform pe. Inventory, orders, commission, settlement, GST
              billing. Sab kuch automated.
            </p>

            <div
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
            >
              <Link
                href="#pricing"
                className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gradient-cta px-8 py-2 text-sm font-medium text-brand-900 shadow-glow-lime transition-transform outline-none hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              >
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/30 bg-white/5 px-8 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              >
                <PlayCircle size={18} />
                See How It Works
              </Link>
            </div>

            {/* Trust indicators */}
            <div
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-brand-200 lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-lime-400 text-lime-400"
                    />
                  ))}
                </div>
                <span>4.9/5 rating</span>
              </div>
              <span className="hidden h-4 w-px bg-white/20 sm:block" />
              <span>✓ No credit card required</span>
              <span className="hidden h-4 w-px bg-white/20 sm:block" />
              <span>✓ 14-day free trial</span>
            </div>
          </div>

          {/* Right Column — Mockup */}
          <div
            className="relative mx-auto w-full min-w-0 max-w-lg lg:max-w-none"
          >
            <div className="relative sm:animate-float">
              {/* Glow */}
              <div className="absolute -inset-4 hidden rounded-3xl bg-gradient-to-r from-brand-500/35 to-lime-500/20 opacity-60 blur-2xl sm:block" />

              {/* Main Dashboard Card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-1.5 shadow-2xl sm:p-2 sm:backdrop-blur-xl">
                <div className="rounded-xl bg-background p-3 text-foreground shadow-inner sm:p-4">
                  {/* Fake dashboard header */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    <div className="ml-2 h-2 flex-1 rounded-full bg-muted" />
                  </div>

                  {/* Stats grid */}
                  <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-2">
                    {[
                      { label: "Sales", value: "₹4.2L", color: "bg-brand-500" },
                      { label: "Orders", value: "1,284", color: "bg-lime-600" },
                      { label: "Dealers", value: "342", color: "bg-green-500" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="min-w-0 rounded-lg border border-border bg-muted/60 p-1.5 sm:p-2"
                      >
                        <div className={`mb-1 h-1 w-6 rounded-full ${s.color}`} />
                        <div className="text-[10px] font-medium text-muted-foreground">
                          {s.label}
                        </div>
                        <div className="text-xs font-bold text-foreground">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart mockup */}
                  <div className="mt-3 rounded-lg border border-border bg-secondary/70 p-3">
                    <div className="mb-2 flex items-end justify-between gap-1">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-brand-400"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  {/* List mockup */}
                  <div className="mt-3 space-y-1.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/50 p-2"
                      >
                        <div className="h-6 w-6 rounded bg-brand-200" />
                        <div className="flex-1 space-y-1">
                          <div className="h-1.5 w-2/3 rounded bg-muted-foreground/35" />
                          <div className="h-1.5 w-1/3 rounded bg-muted-foreground/20" />
                        </div>
                        <div className="text-[10px] font-semibold text-green-600">
                          +₹{120 * i}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge 1 */}
              <div
                className="animate-in fade-in slide-in-from-left-4 delay-700 duration-500 absolute -left-4 top-1/4 hidden rounded-2xl border border-border/70 bg-card p-3 shadow-xl shadow-brand-900/10 backdrop-blur-md sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    ✓
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Order confirmed</div>
                    <div className="text-xs font-semibold text-card-foreground">
                      ₹12,400
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge 2 */}
              <div
                className="animate-in fade-in slide-in-from-right-4 delay-1000 duration-500 absolute -right-4 bottom-1/4 hidden rounded-2xl border border-border/70 bg-card p-3 shadow-xl shadow-brand-900/10 backdrop-blur-md sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    ↑
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Commission</div>
                    <div className="text-xs font-semibold text-card-foreground">
                      +₹2,180
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}