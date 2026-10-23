"use client";

import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  required?: boolean;
  helper?: ReactNode;
  error?: string;
  className?: string;
  children: (ids: { inputId: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/**
 * Label + control + helper or inline error, wired for screen readers: the
 * control is described by the helper/error and marked invalid on error.
 */
export function FormField({ label, required, helper, error, className, children }: FieldShellProps) {
  const inputId = useId();
  const messageId = `${inputId}-msg`;
  const message = error ?? helper;
  return (
    <div className={cn("fx-field", className)}>
      <label htmlFor={inputId} className="fx-field-label">
        {label}
        {required ? (
          <span className="fx-req" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children({ inputId, describedBy: message ? messageId : undefined, invalid: Boolean(error) })}
      {message ? (
        <p id={messageId} className={error ? "fx-field-error" : "fx-helper"} role={error ? "alert" : undefined}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("fx-input", className)} {...props} />;
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("fx-input", className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("fx-input", className)} {...props} />;
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="fx-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className="fx-toggle"
      onClick={() => onChange(!checked)}
    />
  );
}
