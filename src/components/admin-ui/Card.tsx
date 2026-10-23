import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, padded = true, ...props }: HTMLAttributes<HTMLElement> & { padded?: boolean }) {
  return <section className={cn("fx-card", padded && "fx-card-pad", className)} {...props} />;
}

/** Card title row: title + optional description on the left, an action on the right. */
export function CardHeader({
  title,
  description,
  action,
  titleId,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  titleId?: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 id={titleId} className="fx-card-title">
          {title}
        </h2>
        {description ? <p className="mt-1 text-[13px] fx-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex-none">{action}</div> : null}
    </header>
  );
}
