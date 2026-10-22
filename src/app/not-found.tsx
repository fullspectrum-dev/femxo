import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";

export default function NotFound() {
  return (
    <main className="ink band-ink relative flex min-h-svh items-center overflow-hidden py-16">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-50" />
      <Container className="relative text-center">
        <Logo className="justify-center" />
        <p className="mt-12 font-display text-[clamp(5rem,20vw,9rem)] font-bold leading-none text-gold [text-shadow:0_6px_0_rgba(90,30,140,0.55)]">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          This page isn&rsquo;t on the map
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link href="/" className="btn-gold mt-8">
          <ArrowLeft size={17} aria-hidden="true" /> Back to Femxo
        </Link>
      </Container>
    </main>
  );
}
