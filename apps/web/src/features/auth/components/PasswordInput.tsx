"use client";

import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { AuthField } from "./AuthField";

interface PasswordInputProps extends Omit<ComponentProps<"input">, "id" | "name" | "type"> {
  id: string;
  label: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  hint?: ReactNode;
}

export function PasswordInput({ id, label, registration, error, hint, placeholder, ...inputProps }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      registration={registration}
      error={error}
      hint={hint}
      leading={<KeyRound size={17} />}
      placeholder={placeholder ?? "Enter your password"}
      trailing={
        <button
          type="button"
          className="-mr-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
      {...inputProps}
    />
  );
}
