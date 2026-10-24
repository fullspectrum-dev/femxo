import type { HTMLAttributes } from "react";
import { cn } from "../cn";

type CardElement = "div" | "section" | "article" | "li" | "aside";

/** White surface with soft elevation: product cards, panels, order rows. */
export function Card({
  as: Element = "div",
  padded = true,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: CardElement; padded?: boolean }) {
  return <Element className={cn("rounded-card border border-line bg-surface shadow-card", padded && "p-4 md:p-5", className)} {...props} />;
}
