"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sectionHref = (href: string) => (pathname === "/" ? href : `/${href}`);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 overflow-x-clip text-white transition-all duration-300",
        isScrolled || isMobileOpen
          ? "border-b border-border/50 bg-background/95 text-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/85"
          : "bg-transparent"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-3 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex shrink-0 items-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition-transform hover:scale-[1.02]"
            aria-label="Femxo Consultancy Services home"
          >
            <Image
              src="/images/femxo-consultancy-logo.png"
              alt="Femxo Consultancy Services"
              width={737}
              height={339}
              sizes="(min-width: 640px) 96px, 88px"
              quality={50}
              priority
              className="h-10 w-[88px] object-contain sm:h-11 sm:w-[96px]"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={sectionHref(link.href)}
                className="whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
              <Link
                href={sectionHref("#contact")}
                className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-inherit transition-colors outline-none hover:bg-current/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Talk to Sales
              </Link>
              <Link
                href={sectionHref("#pricing")}
                className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground transition-colors outline-none hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View Plans
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Create account
              </Link>
            </div>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="flex size-10 items-center justify-center rounded-xl text-inherit transition-colors hover:bg-current/10 lg:hidden"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      <div
        id="mobile-navigation"
        aria-hidden={!isMobileOpen}
        inert={!isMobileOpen}
        className={cn(
          "grid overflow-hidden border-border/50 bg-background shadow-xl transition-[grid-template-rows,opacity] duration-300 ease-out lg:hidden",
          isMobileOpen
            ? "grid-rows-[1fr] border-t opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        )}
      >
          <div className="min-h-0 overflow-hidden">
            <Container className="py-4">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={sectionHref(link.href)}
                    onClick={() => setIsMobileOpen(false)}
                    className="rounded-md px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Create account
                </Link>
                <Link
                  href={sectionHref("#contact")}
                  onClick={() => setIsMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Talk to Sales
                </Link>
                <Link
                  href={sectionHref("#pricing")}
                  onClick={() => setIsMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors outline-none hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  View Plans
                </Link>
              </div>
            </Container>
          </div>
      </div>
    </header>
  );
}