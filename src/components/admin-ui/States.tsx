import { CircleAlert, Hexagon, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The four system states every list and page needs (Foundations): loading,
 * empty, error and permission denied.
 */

export function LoadingSkeleton({ rows = 5, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-3 p-5">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="fx-skeleton h-9" style={{ width: `${92 - (index % 3) * 12}%` }} />
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

function StateFrame({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid justify-items-center gap-3 px-6 py-12 text-center", className)}>
      {icon}
      <p className="text-[15px] font-semibold">{title}</p>
      <p className="max-w-[300px] text-[13px] fx-muted">{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <StateFrame
      icon={
        <span className="fx-state-icon fx-state-icon--primary" aria-hidden="true">
          <Hexagon size={20} />
        </span>
      }
      title={title}
      message={message}
      action={action}
    />
  );
}

export function ErrorState({
  title = "Couldn’t load data",
  message = "The request failed. Your changes are safe.",
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div role="alert">
      <StateFrame
        icon={
          <span className="fx-state-icon fx-state-icon--error" aria-hidden="true">
            <CircleAlert size={20} />
          </span>
        }
        title={title}
        message={message}
        action={action}
      />
    </div>
  );
}

export function AccessDenied({
  message = "Your role does not include this module.",
  action,
}: {
  message?: string;
  action?: ReactNode;
}) {
  return (
    <StateFrame
      icon={
        <span className="fx-state-icon fx-state-icon--gold" aria-hidden="true">
          <Lock size={20} />
        </span>
      }
      title="Access denied"
      message={message}
      action={action}
    />
  );
}
