"use client";

import { Crown, House, LayoutGrid, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn, Sheet } from "@femxo/ui";
import type { NavCategory } from "../categories";

const itemClasses =
  "flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-control text-[11px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus";

function BarLink({ href, icon, label, active }: { href: string; icon: ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn(itemClasses, active ? "text-primary" : "text-ink-muted")}>
      {icon}
      {label}
    </Link>
  );
}

/** Phone navigation: Home, Categories (a sheet, not a page), Prime, Account. */
export function BottomBar({ categories }: { categories: readonly NavCategory[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-4 px-2">
        <li>
          <BarLink href="/" label="Home" active={isActive("/")} icon={<House size={20} aria-hidden="true" />} />
        </li>
        <li>
          <button type="button" className={cn(itemClasses, "text-ink-muted")} aria-haspopup="dialog" onClick={() => setOpen(true)}>
            <LayoutGrid size={20} aria-hidden="true" />
            Categories
          </button>
        </li>
        <li>
          <BarLink href="/prime" label="Prime" active={isActive("/prime")} icon={<Crown size={20} aria-hidden="true" />} />
        </li>
        <li>
          <BarLink href="/account" label="Account" active={isActive("/account")} icon={<UserRound size={20} aria-hidden="true" />} />
        </li>
      </ul>

      <Sheet open={open} onClose={() => setOpen(false)} title="All categories">
        <ul className="grid gap-1">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/c/${category.slug}`}
                onClick={() => setOpen(false)}
                className="flex h-12 items-center rounded-control px-3 text-[15px] font-medium text-ink hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-focus"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </nav>
  );
}
