"use client";

import type { ComponentProps, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends Omit<ComponentProps<"input">, "id" | "name" | "prefix"> {
  id: string;
  label: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  hint?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function AuthField({
  id,
  label,
  registration,
  error,
  hint,
  leading,
  trailing,
  className,
  ...inputProps
}: AuthFieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border bg-card px-3.5 transition-[border-color,box-shadow]",
          "focus-within:border-primary focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/0.14)]",
          error ? "border-red-500/70" : "border-input"
        )}
      >
        {leading && (
          <span className="shrink-0 text-muted-foreground" aria-hidden="true">
            {leading}
          </span>
        )}
        <input
          id={id}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0",
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...registration}
          {...inputProps}
        />
        {trailing}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <div className="mt-1.5 text-xs text-muted-foreground" id={`${id}-hint`}>
            {hint}
          </div>
        )
      )}
    </div>
  );
}
