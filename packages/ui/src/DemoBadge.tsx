import { cn } from "./cn";

/** Marks figures as sample data, so mock numbers never pass for live ones. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      title="Sample figures for the demo. Nothing here is live."
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900",
        className
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Demo data
    </span>
  );
}
