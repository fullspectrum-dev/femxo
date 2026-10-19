"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { AuthField } from "./AuthField";

interface PasswordInputProps
  extends Omit<ComponentProps<"input">, "id" | "name" | "type"> {
  id: string;
  label: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  leading?: ReactNode;
}

export function PasswordInput({
  id,
  label,
  registration,
  error,
  hint,
  leading,
  ...inputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <AuthField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      registration={registration}
      error={error}
      hint={hint}
      leading={leading}
      autoComplete={inputProps.autoComplete}
      placeholder={inputProps.placeholder ?? "Enter your password"}
      trailing={
        <button
          type="button"
          className="auth-password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={visible ? "visible" : "hidden"}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.85 }}
              transition={{ duration: reduceMotion ? 0 : 0.12 }}
            >
              {visible ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      }
      {...inputProps}
    />
  );
}
