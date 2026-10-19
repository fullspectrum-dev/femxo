"use client";

import type { ComponentProps } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface AuthSelectProps
  extends Omit<ComponentProps<"select">, "id" | "name"> {
  id: string;
  label: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function AuthSelect({
  id,
  label,
  registration,
  error,
  options,
  ...selectProps
}: AuthSelectProps) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="auth-select"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...registration}
        {...selectProps}
      >
        <option value="" disabled>
          Choose an account type
        </option>
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
      {error && (
        <p className="auth-field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
