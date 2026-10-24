# Femxo customer storefront — P3 build plan

Builds the design in [design.md](./design.md). Steps run in dependency order,
grouped into **9 groups (G0–G8)**. You approve after each group (P1 #19).

**Every step follows TDD:** write the listed tests first and see them fail
(RED), write the least code to pass (GREEN), then refactor with tests green.

**Gate at the end of every step:** `pnpm -r typecheck`, `pnpm -r lint`,
`pnpm -r test` green (and the E2E specs that exist so far). A step isn't done
until it meets the Definition of Done: tests + loading/empty/error states +
responsive (390/768/1280) + accessible + works on seeded demo data.

Legend: **T** = tests written first · **AC** = acceptance criteria.

---

## G0 — Workspace (no behaviour change)

**0.1 Convert to a pnpm workspace; move the current app to `apps/web`**
- T: the existing suites are the safety net — 15 unit + 18 E2E must stay green
  after the move, unchanged.
- AC: `apps/web` builds and runs as today (port 3001); `Dockerfile`, Playwright
  configs and scripts updated; root scripts `dev:web`, `dev:shop`, `test`,
  `typecheck`, `lint` fan out with `pnpm -r`; git history kept (`git mv`).
- Why first: every later step lives in the new layout; doing it later means
  moving more code.

**0.2 Scaffold `apps/web-customer`, `packages/shared`, `packages/ui`**
- T: a smoke unit test per package; a Playwright smoke test that `/` on port
  3002 renders and shows the "Demo data" badge.
- AC: Next 16 app with the same TS strict / ESLint / Vitest / Playwright setup
  as `apps/web`; workspace imports (`@femxo/shared`, `@femxo/ui`) resolve in
  server and client components; `NEXT_PUBLIC_API_MODE` read in one place.

---

## G1 — Design tokens and UI kit (`packages/ui`)

**1.1 Tokens**
- T: unit test that every token used by components exists in `tokens.css`
  (parsed); contrast test for text/background token pairs (AA).
- AC: Femxo palette (primary #6C35A5, deep #45216F, gold #FFC45E, ink
  #12071F), Space Grotesk + Inter, radii, spacing, 3D "key" button shadows,
  soft card elevation, warm storefront surfaces; light theme (dark later only
  if asked — not in scope).

**1.2 Core components** — Button, IconButton, Card, Badge, Price (MRP / price /
Prime price, discount %), Rating, Skeleton, Sheet (bottom sheet ↔ side
drawer), Dialog, Toast, Tabs, Stepper, QuantityStepper, EmptyState,
ErrorState, OfflineBanner.
- T: RTL test per component (roles, labels, keyboard), vitest-axe per
  component, Price formatting cases (₹ Indian grouping, strike-through MRP,
  "You save").
- AC: server-safe where they have no interactivity; 44px touch targets;
  focus-visible styles; RTL + axe green.

**1.3 Storefront shell** — header (logo, search box slot, account, cart count),
category nav, footer with "Demo data" badge, mobile bottom bar.
- T: RTL: cart count and account slots render; footer badge present in mock
  mode and absent in http mode; Playwright at 390/768/1280 — no horizontal
  scroll.
- AC: responsive at all three widths; skip link; landmarks.

---

## G2 — Shared contracts, mock layer, seed (`packages/shared`)

**2.1 Contracts** — zod schemas and types from design §3, error codes, `page()`.
- T: schema tests — valid fixtures parse, invalid ones fail with useful paths
  (e.g. price above MRP, limit 101, bad pincode).
- AC: types inferred from schemas only (no duplicate interfaces).

**2.2 Lib** — money (paise), GST split (CGST/SGST from inclusive price), ids,
seeded RNG, mock clock, PII-redacting logger.
- T: GST rounding cases (sum of parts = total), RNG determinism, logger
  redacts mobiles/emails.

**2.3 Adapter + client core** — `ApiAdapter` interface, `createApi()`,
`HttpAdapter` (fetch wrapper: credentials, CSRF header slot, Idempotency-Key,
10 s timeout, error-envelope mapping), `ApiError`.
- T: HttpAdapter against a stubbed `fetch`: headers set, timeout → `ApiError`
  `INTERNAL`, error envelope → typed error, non-JSON body handled.
- AC: no feature code ever calls `fetch` directly (lint rule).

**2.4 Mock router + behaviours** — REST-shaped router, latency, chaos,
forced outcomes, idempotency cache (24 h, mismatch → 422), cursor pagination
(max 100), request validation (→ 422), stores (memory + IndexedDB with schema
version + reset).
- T: contract-style tests on a dummy endpoint: missing key → 400, replay →
  identical body, same key + new body → 422, limit 101 → 422, chaos off by
  default in tests, IndexedDB persistence across store re-open (fake-indexeddb),
  version bump reseeds.

**2.5 Seed** — catalog (~200 products, categories, brands, variants, batches,
price tiers), users, addresses, orders in every status, coupons, reviews,
pincodes, search synonyms; product image build script (SVG → 800×800 WebP).
- T: seed is deterministic (stable hash), every seeded entity parses with its
  schema, invariants (MRP ≥ price ≥ Prime price; at least one low-stock and
  one out-of-stock variant; every order status present; every category has
  products; all image files exist).
- AC: `pnpm --filter @femxo/shared seed:images` regenerates images; images
  committed so builds don't depend on the script.

**2.6 Devtools panel** (`apps/web-customer/features/devtools`) — chaos toggle,
force next payment outcome / 500 / offline, advance clock, reset demo data.
- T: RTL — controls call the mock control API; panel not rendered in http mode.

---

## G3 — Auth (mobile OTP + email/password)

**3.1 AuthApi in the mock** — OTP request/verify, signup completion,
email/password login, refresh, logout, `me`, `updateMe`.
- T (contract): OTP `123456` succeeds; wrong code → `OTP_INVALID` with attempts
  left; 5 wrong → `RATE_LIMITED` with retry-after (15 min); resend before 30 s
  → `RATE_LIMITED`; 4th resend refused; expired after 5 min (clock); new mobile
  → `isNewUser`; refresh rotation (reused refresh token kills the session).

**3.2 Session provider + guards** — in-memory token, single in-flight refresh,
`RequireCustomer` / `RequirePrime`, `?next=` return.
- T: RTL — guard shows login-required state, redirects with `next`; refresh
  race test (two calls → one request).

**3.3 Login / signup UI** — mobile entry → OTP (6 boxes, paste, resend
countdown, lockout message) → name/email for new users; email/password tab.
- T: RTL — validation (Indian mobile), countdown, lockout copy, focus moves;
  axe. E2E: guest → login with OTP → returns to previous page.
- AC: reuses patterns from `apps/web` auth; the old demo-mode flag keeps
  working for `apps/web`.

---

## G4 — Catalog and search

**4.1 Home** — banners, deals, category grid, Prime strip; server-rendered
from the seed with `use cache`.
- T: RTL on sections with seed fixtures; E2E: home renders, a category link
  opens the listing. Build check: route is static.

**4.2 Category listing** — first page server-rendered; filters (brand, price,
rating, Prime) and sort client-side, synced to the URL; cursor "Load more".
- T: contract — facet counts match filtered items; sorts correct; cursor
  pages don't repeat or skip. RTL — filter chips, clear all, empty result
  state. E2E — filter by brand + sort by price persists across reload.

**4.3 Search + suggestions** — typo tolerance, synonyms, facets, suggestions
dropdown (keyboard navigable, debounced).
- T: unit — "biskit" finds biscuits, "aata" finds atta, prefix suggestions,
  `correctedQuery` set; RTL — combobox ARIA, arrow keys, Enter, Escape; E2E —
  type → suggestion → results with facets.

---

## G5 — Product page and reviews

**5.1 Product detail** — gallery (thumbnails, swipe, zoom-safe), variant
picker, price + Prime price, stock, best-before, highlights/specs, returnable
note; JSON-LD; top products prerendered.
- T: RTL — variant change updates price/stock/SKU; out-of-stock disables
  add; JSON-LD escaped; E2E — open product, switch variant.

**5.2 Pincode delivery check** — serviceable / not serviceable / invalid, ETA,
COD flag; remembers last pincode.
- T: contract + RTL for each outcome.

**5.3 Reviews + related** — summary histogram, sorted paged list, related rail.
- T: RTL — histogram labels, load more, empty reviews state.

---

## G6 — Cart and wishlist

**6.1 Cart** — add from PDP/cards, quantity (optimistic, rollback on 409),
remove, price breakup (MRP, discount, Prime savings, coupon, delivery, GST
included, you save), expiry (`410` → fresh cart notice), guest → login merge.
- T: unit — breakup maths incl. free delivery threshold and Prime; contract —
  add beyond stock → 409, merge caps at stock/maxPerOrder, expiry after 7 days
  (clock); RTL — optimistic update + rollback message; E2E — add, change qty,
  totals correct.

**6.2 Coupons** — apply/remove, reasons for refusal (min cart, expired,
exhausted, Prime-only, first order only).
- T: unit per rule; RTL — error copy per reason.

**6.3 Wishlist** — add/remove (login-gated), move to cart.
- T: RTL + contract; E2E — guest taps heart → login → item saved.

---

## G7 — Checkout, payment, orders, account

**7.1 Checkout: address step** — pick/add address (validated, serviceable
only), default address preselected.
- T: RTL — form validation, non-serviceable pincode blocked; guard redirects.

**7.2 Checkout: delivery + payment steps** — delivery option and fee; method
(UPI/card/netbanking/COD ≤ ₹2,000); place order with a stable idempotency key;
demo payment sheet (success/fail/pending); pending polling; confirmation.
- T: contract — duplicate place-order (same key) returns the same order;
  stock conflict at place-order → 409 with lines; payment retry creates
  attempt 2 on the same order. RTL — sheet outcomes, double-click sends one
  request. E2E (required) — happy path; fail → retry → success; 409 conflict
  recovery; duplicate submit.

**7.3 Orders** — history (status filter, cursor), detail with tracking
timeline, cancel (until packed), return request (7 days, non-returnable
items excluded), retry payment for failed orders.
- T: contract — cancel after packing refused; return window and returnable
  rules; RTL — timeline states incl. cancelled/failed; E2E — order placed →
  tracking advances (devtools clock).

**7.4 Account** — profile (name, email, birthday), address book (CRUD,
default), support tickets (create with optional order, list, thread, reply).
- T: RTL + contract per form; empty states.

---

## G8 — Prime, polish, verify

**8.1 Prime plans + purchase** — plans page, purchase through the same
payment flow, prices switch to Prime immediately.
- T: contract — purchase idempotent; membership active after payment;
  E2E — buy Prime → cart shows Prime prices.

**8.2 Membership card, coupons, referrals, birthday** — QR card (member id,
validity), Prime coupons, referral link (copy/share) + stats, birthday banner.
- T: RTL — QR rendered with accessible text equivalent; copy link feedback;
  banner shows only on birthday (clock).

**8.3 Polish** — skeletons everywhere, offline banner + `/offline`, error
boundaries, i18n sweep (no hard-coded strings in features), 404/500 pages.
- T: lint rule/test that feature components use `t()`; E2E offline banner.

**8.4 Performance** — next/image sizes and priority, font subsetting,
bundle check, Lighthouse CI on a production build.
- AC: `/`, a category and a product page: LCP < 2.5 s, CLS < 0.1 on
  mobile/4G simulation; report saved.

**8.5 VERIFY (P5)** — full test run, all E2E (happy + failure paths) at
390/768/1280, axe on key pages, performance report, known-issues list.

---

## Required E2E flows → where they land

| Flow | Step |
|---|---|
| Guest browse → OTP login → add to cart → coupon → pay (success) → tracking | 3.3, 4.x, 6.1, 6.2, 7.2, 7.3 |
| Payment fail → retry | 7.2 |
| Stock conflict (409) | 6.1, 7.2 |
| Duplicate submit (idempotency) | 7.2 |

## Rough size

~30 steps. G0–G2 are the foundation (largest risk); each later group is a
self-contained slice you can demo.
