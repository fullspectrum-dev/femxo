"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Children, isValidElement } from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = Omit<
  ComponentProps<typeof ButtonPrimitive>,
  "className" | "render"
> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  asChild?: boolean;
  className?: string;
  children?: ReactNode;
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "size-10",
  "icon-sm": "size-8",
};

function Button({
  variant = "default",
  size = "default",
  asChild = false,
  className,
  children,
  nativeButton,
  ...props
}: ButtonProps) {
  let render: ReactElement | undefined;
  if (asChild) {
    const childElements = Children.toArray(children);
    if (childElements.length !== 1 || !isValidElement(childElements[0])) {
      throw new Error("Button with asChild requires exactly one child element.");
    }
    render = childElements[0];
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      render={render}
      nativeButton={asChild ? false : nativeButton}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
}

export { Button };