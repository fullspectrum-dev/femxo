import { Star } from "lucide-react";
import { cn } from "../cn";

/** Average rating and count; read out as one sentence by screen readers. */
export function Rating({ value, count, className }: { value: number; count: number; className?: string }) {
  if (count === 0) return <p className={cn("text-sm text-ink-muted", className)}>No ratings yet</p>;
  const average = value.toFixed(1);
  const total = count.toLocaleString("en-IN");
  return (
    <p
      role="img"
      aria-label={`Rated ${average} out of 5 from ${total} ratings`}
      className={cn("inline-flex items-center gap-1.5 text-sm", className)}
    >
      <span className="inline-flex items-center gap-0.5 rounded-md bg-success px-1.5 py-0.5 text-xs font-bold text-on-primary">
        {average}
        <Star size={11} fill="currentColor" aria-hidden="true" />
      </span>
      <span className="text-ink-muted">({total})</span>
    </p>
  );
}
