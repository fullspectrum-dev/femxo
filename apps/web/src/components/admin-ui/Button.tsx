import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "gold" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Square button holding only an icon; pass an aria-label. */
  iconOnly?: boolean;
}

/**
 * Foundations "3D key" button. Purple for primary actions, gold for financial
 * or highlight actions, red for destructive ones.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", block, iconOnly, className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "fx-btn",
        `fx-btn--${variant}`,
        size !== "md" && `fx-btn--${size}`,
        block && "fx-btn--block",
        iconOnly && "fx-btn--icon",
        className
      )}
      {...props}
    />
  );
});
