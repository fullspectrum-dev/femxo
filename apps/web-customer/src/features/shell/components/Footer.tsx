import { apiMode, type ApiMode } from "@femxo/shared";
import { DemoBadge } from "@femxo/ui";
import Link from "next/link";

const linkClasses = "rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-focus";

/** Site footer. While the store runs on the mock API it says so (design §7). */
export function Footer({ mode = apiMode }: { mode?: ApiMode }) {
  return (
    <footer className="border-t border-line bg-surface px-4 py-8 text-sm text-ink-muted">
      <div className="mx-auto grid max-w-7xl gap-4 md:flex md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/prime" className={linkClasses}>
              Femxo Prime
            </Link>
          </li>
          <li>
            <Link href="/account/support" className={linkClasses}>
              Help &amp; support
            </Link>
          </li>
          <li>
            <a href="https://femxo.in" className={linkClasses}>
              About Femxo
            </a>
          </li>
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <p>© Femxo Consultancy Services Pvt. Ltd.</p>
          {mode === "mock" ? <DemoBadge /> : null}
        </div>
      </div>
    </footer>
  );
}
