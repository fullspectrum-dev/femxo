import Link from "next/link";
import { Container } from "@/components/shared/Container";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background py-16">
      <Container className="text-center">
        <p className="font-display text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to home
        </Link>
      </Container>
    </main>
  );
}