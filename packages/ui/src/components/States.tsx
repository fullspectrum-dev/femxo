import { CircleAlert, PackageOpen } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../cn";
import { Button } from "./Button";

function Frame({ icon, children, className }: { icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto grid max-w-sm justify-items-center gap-3 px-4 py-12 text-center", className)}>
      {icon}
      {children}
    </div>
  );
}

/** Nothing to show yet: a heading, why, and what to do next. */
export function EmptyState({
  title,
  message,
  action,
  headingLevel = 2,
  className,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <Frame
      className={className}
      icon={
        <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
          <PackageOpen size={26} />
        </span>
      }
    >
      <Heading className="font-display text-lg font-semibold text-ink">{title}</Heading>
      {message ? <p className="text-sm text-ink-muted">{message}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </Frame>
  );
}

/** A request failed: announced, with a retry. */
export function ErrorState({
  title = "Something went wrong",
  message = "Please check your connection and try again.",
  onRetry,
  retryLabel = "Try again",
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div role="alert">
      <Frame
        className={className}
        icon={
          <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-danger-soft text-danger">
            <CircleAlert size={26} />
          </span>
        }
      >
        <p className="font-display text-lg font-semibold text-ink">{title}</p>
        <p className="text-sm text-ink-muted">{message}</p>
        {onRetry ? (
          <Button variant="secondary" className="mt-2" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </Frame>
    </div>
  );
}
