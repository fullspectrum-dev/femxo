"use client";

import type { ComponentProps, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface AuthFieldProps
  extends Omit<ComponentProps<"input">, "id" | "name" | "prefix"> {
  id: string;
  label: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  prefix?: ReactNode;
}

export function AuthField({
  id,
  label,
  registration,
  error,
  hint,
  leading,
  trailing,
  prefix,
  className = "",
  ...inputProps
}: AuthFieldProps) {
  const describedBy = [
    error ? `${id}-error` : null,
    hint ? `${id}-hint` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      <div className={`auth-input-wrap ${error ? "has-error" : ""}`}>
        {prefix && <span className="auth-input-prefix">{prefix}</span>}
        {leading && (
          <span className="auth-input-leading" aria-hidden="true">
            {leading}
          </span>
        )}
        <input
          id={id}
          className={`auth-input ${leading ? "has-leading" : ""} ${trailing ? "has-trailing" : ""} ${prefix ? "has-prefix" : ""} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...registration}
          {...inputProps}
        />
        {trailing && <span className="auth-input-trailing">{trailing}</span>}
      </div>
      {error && (
        <p className="auth-field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="auth-field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
