import { Crown, Search, ShoppingCart, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@femxo/ui";

const linkClasses =
  "inline-flex h-11 items-center gap-2 rounded-control px-3 text-sm font-semibold text-ink hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-focus";

/**
 * Site header: logo, search, Prime, account and cart. On phones Prime and
 * account move to the bottom bar and search takes its own row.
 */
export function Header({ cartCount }: { cartCount: number }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:flex-nowrap md:gap-x-5">
        <Link href="/" aria-label="Femxo home" className="flex flex-none items-center gap-2 rounded-control focus-visible:outline-2 focus-visible:outline-focus">
          <Image src="/images/femxo-mark.png" alt="" width={390} height={570} priority className="h-8 w-auto" />
          <span aria-hidden="true" className="font-display text-xl font-bold text-primary">
            Femxo
          </span>
        </Link>

        {/* A plain GET form: search works before JavaScript loads. */}
        <form role="search" action="/search" method="get" className="order-last w-full md:order-none md:flex-1">
          <label htmlFor="site-search" className="sr-only">
            Search Femxo
          </label>
          <div className="flex h-11 items-center rounded-control border border-line-input bg-surface focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-focus">
            <input
              id="site-search"
              type="search"
              name="q"
              autoComplete="off"
              placeholder="Search atta, oil, soap and more"
              className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted"
            />
            <button type="submit" aria-label="Search" className="grid h-11 w-12 flex-none place-items-center rounded-r-control text-primary hover:bg-primary-soft">
              <Search size={20} aria-hidden="true" />
            </button>
          </div>
        </form>

        <nav aria-label="Account and cart" className="ml-auto flex flex-none items-center gap-1">
          <Link href="/prime" className={cn(linkClasses, "hidden md:inline-flex")}>
            <Crown size={18} className="text-gold-deep" aria-hidden="true" />
            Prime
          </Link>
          <Link href="/account" className={cn(linkClasses, "hidden md:inline-flex")}>
            <UserRound size={18} aria-hidden="true" />
            Account
          </Link>
          {/* The real count arrives with CartApi (G6). */}
          <Link href="/cart" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`} className={cn(linkClasses, "relative")}>
            <ShoppingCart size={20} aria-hidden="true" />
            <span aria-hidden="true" className="hidden lg:inline">
              Cart
            </span>
            {cartCount > 0 ? (
              <span aria-hidden="true" className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-on-primary">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
