import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full border border-brand-300/40 bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:border-brand-700/40 dark:bg-brand-900/40 dark:text-brand-300">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}