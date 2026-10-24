import { cn } from "../cn";

/** Placeholder block while content loads. The loading region announces itself, so this is hidden. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-surface-sunken", className)} />;
}
