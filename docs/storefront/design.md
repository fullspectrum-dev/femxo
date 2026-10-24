# Femxo customer storefront — P2 design

Scope: Module 14 (Customer storefront) and Module 8 (Prime) from the Plan of
Action, Phase 3. Frontend only, on a mock API that keeps the contract the real
API will have. Decisions from P1 are taken as approved (all defaults).

Each decision carries a one-line **why**.

---

## 1. Architecture

```
                       NEXT_PUBLIC_API_MODE = mock | http
                                    │
 apps/web-customer (Next 16)        ▼
 ┌──────────────────────────┐   ┌──────────────────────────────────────────┐
 │ Server components         │   │ packages/shared                          │
 │  home · category · product│──▶│  api/        createApi(adapter) →        │
 │  (prerendered, use cache) │   │              products, search, cart, …   │
 │                           │   │              every response zod-parsed   │
 │ Client components         │   │  contracts/  zod schemas + types         │
 │  cart · checkout · account│──▶│              (= draft API contract)      │
 │  prime · islands on PDP   │   │  adapters/http  fetch wrapper            │
 │  (TanStack Query)         │   │  adapters/mock  REST-shaped router:      │
 └──────────────────────────┘   │     latency · errors · idempotency ·     │
                                │     cursors · TTL · OTP · clock          │
 packages/ui                    │  mock/seed   deterministic data (RNG)    │
  tokens.css, Button, Card,     │  mock/store  IndexedDB (browser)         │
  ProductCard, Price, Rating,   │              memory (server, tests)      │
  Skeleton, Sheet, Toast, …     └──────────────────────────────────────────┘
```

**One client, two adapters.** Domain clients (`ProductsApi`, `CartApi`, …) are
written once over an `ApiAdapter` (the generalised `Transport` the auth module
already uses). `HttpAdapter` sends real requests; `MockAdapter` routes the same
`{ method, path, query, body, headers }` to in-browser handlers.
*Why:* the same request building and zod parsing run in both modes, so moving
to `http` can't break the UI; the mock's paths double as the Swagger draft.

**Where the mode is chosen:** only in `packages/shared/src/api/index.ts`.
*Why:* one switch, no `if (mock)` anywhere in features.

**Server vs browser data.** The server can't read browser storage, so:
- Catalog data (products, categories, brands, reviews, banners) is
  deterministic seed data. Server components read it through a server-side
  `MockAdapter` (memory store, no latency, no chaos) and cache it.
- Everything per-user (session, cart, wishlist, addresses, orders, Prime,
  stock after your orders) lives in the browser `MockAdapter` (IndexedDB).
- Product pages prerender seed stock and price, then a client island
  refreshes stock and the price for the viewer's tier.
- In `http` mode the server adapter calls the API instead; nothing else changes.

---

## 2. Repository layout

The repo becomes a pnpm workspace (P1 #1). The existing app moves unchanged.

```
femxo-frontend/
├─ apps/
│  ├─ web/                    current marketing site + auth + Super Admin (moved as-is)
│  └─ web-customer/           NEW storefront, dev port 3002
│     ├─ src/app/             routes (section 5)
│     ├─ src/features/<module>/{components,hooks,api,tests}
│     │    catalog · search · product · reviews · cart · wishlist · auth ·
│     │    checkout · payment · orders · account · support · prime · devtools
│     ├─ src/i18n/            en.ts dictionary + typed t()
│     ├─ e2e/                 Playwright specs
│     └─ next.config.ts · vitest.config.ts · playwright.config.ts
├─ packages/
│  ├─ shared/src/
│  │  ├─ contracts/           zod schemas + inferred types, error codes
│  │  ├─ api/                 createApi(), domain clients, query keys
│  │  ├─ adapters/http/       fetch wrapper (CSRF, idempotency, timeouts, errors)
│  │  ├─ adapters/mock/       router, handlers per module, chaos, idempotency cache
│  │  ├─ mock/seed/           rng, catalog, users, orders, coupons, reviews, pincodes
│  │  ├─ mock/store/          IndexedDB + memory stores, schema version, reset
│  │  └─ lib/                 money (paise), gst, ids, clock, logger (PII-redacting)
│  └─ ui/src/                 tokens.css + components (server-safe where possible)
├─ docs/storefront/           this design, ADRs for the storefront
└─ pnpm-workspace.yaml        apps/*, packages/*
```

*Why packages are source-only (no build step):* Next/Turbopack transpiles
workspace packages automatically (Next docs: `transpilePackages`), so
`packages/*` ship TypeScript and stay fast to change.

---

## 3. Contracts (zod, `packages/shared/contracts`)

Conventions (match femxo-backend and the admin prototype):
- Money is **integer paise**. GST rates in **basis points** (500 = 5%).
- Prices are **GST-inclusive** (Indian retail MRP).
- IDs are opaque strings. Timestamps are ISO-8601 strings (UTC).
- Lists: `{ items, nextCursor: string | null }`, `limit` ≤ 100.
- Errors: `{ error: { code, message, details? } }` (same envelope as `/auth`).

```ts
// common.ts
export const Paise = z.number().int().nonnegative();
export const Cursor = z.string().nullable();
export const page = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), nextCursor: Cursor });

export const ApiErrorCode = z.enum([
  "VALIDATION_FAILED",        // 422
  "IDEMPOTENCY_KEY_REQUIRED", // 400
  "IDEMPOTENCY_MISMATCH",     // 422 same key, different body
  "UNAUTHENTICATED",          // 401
  "FORBIDDEN",                // 403
  "NOT_FOUND",                // 404
  "OUT_OF_STOCK",             // 409 details: { variantId, available }
  "PRICE_CHANGED",            // 409 details: { lines }
  "CART_EXPIRED",             // 410
  "COUPON_INVALID",           // 422 details: { reason }
  "NOT_SERVICEABLE",          // 422
  "OTP_INVALID",              // 422 details: { attemptsLeft }
  "OTP_EXPIRED",              // 422
  "RATE_LIMITED",             // 429 + retryAfterSeconds (OTP lockout, resend)
  "PAYMENT_FAILED",           // 402
  "INTERNAL",                 // 500
]);
export const ApiErrorBody = z.object({
  error: z.object({ code: ApiErrorCode, message: z.string(), details: z.record(z.unknown()).optional() }),
});

// catalog.ts
export const Category = z.object({
  id: z.string(), slug: z.string(), name: z.string(), parentId: z.string().nullable(),
  image: z.string(), productCount: z.number().int(),
});
export const Brand = z.object({ id: z.string(), slug: z.string(), name: z.string() });
export const Variant = z.object({
  id: z.string(), sku: z.string(), label: z.string(),          // "1 kg", "Pack of 2"
  mrp: Paise, price: Paise, primePrice: Paise,                 // mrp ≥ price ≥ primePrice
  gstBps: z.number().int(), stock: z.number().int().nonnegative(),
  maxPerOrder: z.number().int().positive(),
  bestBefore: z.string().nullable(),                           // nearest unexpired batch
});
export const ProductSummary = z.object({                      // cards, lists, search hits
  id: z.string(), slug: z.string(), name: z.string(), brand: Brand,
  categoryId: z.string(), image: z.string(),
  rating: z.number().min(0).max(5), ratingCount: z.number().int(),
  fromPrice: Paise, fromPrimePrice: Paise, mrp: Paise,
  inStock: z.boolean(), primeExclusive: z.boolean(), badges: z.array(z.string()),
});
export const ProductDetail = ProductSummary.extend({
  description: z.string(), highlights: z.array(z.string()),
  images: z.array(z.object({ src: z.string(), alt: z.string() })).min(1),
  variants: z.array(Variant).min(1), returnable: z.boolean(),
  specs: z.array(z.object({ label: z.string(), value: z.string() })),
  breadcrumbs: z.array(Category.pick({ id: true, slug: true, name: true })),
});

// search.ts
export const SearchQuery = z.object({
  q: z.string().max(100).default(""), category: z.string().optional(),
  brand: z.array(z.string()).default([]), minPrice: Paise.optional(), maxPrice: Paise.optional(),
  rating: z.number().int().min(1).max(4).optional(), prime: z.boolean().optional(),
  sort: z.enum(["relevance", "price_asc", "price_desc", "rating", "newest", "discount"]).default("relevance"),
  cursor: Cursor.optional(), limit: z.number().int().min(1).max(100).default(24),
});
export const Facets = z.object({
  brands: z.array(z.object({ id: z.string(), name: z.string(), count: z.number().int() })),
  priceBuckets: z.array(z.object({ min: Paise, max: Paise.nullable(), count: z.number().int() })),
  ratings: z.array(z.object({ atLeast: z.number().int(), count: z.number().int() })),
  primeCount: z.number().int(),
});
export const SearchResult = page(ProductSummary).extend({
  total: z.number().int(), facets: Facets, correctedQuery: z.string().nullable(),
});
export const Suggestion = z.object({
  kind: z.enum(["query", "product", "category", "brand"]), label: z.string(), href: z.string(),
});

// cart.ts
export const CartLine = z.object({
  id: z.string(), product: ProductSummary, variant: Variant, quantity: z.number().int().positive(),
  unitPrice: Paise, lineTotal: Paise, available: z.number().int(),
});
export const PriceBreakup = z.object({
  mrpTotal: Paise, discount: Paise, primeSavings: Paise, couponDiscount: Paise,
  delivery: Paise, total: Paise,
  gstIncluded: z.object({ cgst: Paise, sgst: Paise }),   // intra-Bihar
  youSave: Paise,
});
export const Cart = z.object({
  id: z.string(), lines: z.array(CartLine), coupon: z.object({ code: z.string(), label: z.string() }).nullable(),
  breakup: PriceBreakup, itemCount: z.number().int(),
  expiresAt: z.string(),                                 // updatedAt + 7 days
});

// account.ts
export const Address = z.object({
  id: z.string(), name: z.string().min(2).max(60), mobile: z.string().regex(/^[6-9]\d{9}$/),
  line1: z.string().min(3).max(120), line2: z.string().max(120).optional(), landmark: z.string().max(80).optional(),
  city: z.string(), district: z.string(), state: z.literal("Bihar"), pincode: z.string().regex(/^\d{6}$/),
  isDefault: z.boolean(),
});
export const Serviceability = z.object({
  pincode: z.string(), serviceable: z.boolean(), district: z.string().nullable(),
  etaDays: z.object({ min: z.number().int(), max: z.number().int() }).nullable(), codAvailable: z.boolean(),
});

// orders.ts
export const OrderStatus = z.enum([
  "placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered",
  "cancelled", "delivery_failed", "return_requested", "returned", "refunded",
]);
export const PaymentStatus = z.enum(["pending", "paid", "failed", "refunded", "cod"]);
export const TimelineEvent = z.object({ status: OrderStatus, at: z.string(), note: z.string().optional() });
export const OrderSummary = z.object({
  id: z.string(), number: z.string(), placedAt: z.string(), status: OrderStatus,
  paymentStatus: PaymentStatus, total: Paise, itemCount: z.number().int(), thumbnail: z.string(),
});
export const OrderDetail = OrderSummary.extend({
  lines: z.array(CartLine.omit({ available: true })), breakup: PriceBreakup, address: Address,
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"]), timeline: z.array(TimelineEvent),
  canCancel: z.boolean(), canReturnUntil: z.string().nullable(), paymentRetryable: z.boolean(),
});

// checkout / payment
export const DeliveryOption = z.object({
  id: z.literal("standard"), label: z.string(), fee: Paise, etaDays: z.object({ min: z.number(), max: z.number() }),
});
export const CheckoutSession = z.object({
  id: z.string(), cartId: z.string(), address: Address.nullable(), delivery: DeliveryOption.nullable(),
  options: z.array(DeliveryOption), breakup: PriceBreakup, codAllowed: z.boolean(),
});
export const PaymentIntent = z.object({
  id: z.string(), orderId: z.string(), amount: Paise, status: z.enum(["created", "pending", "succeeded", "failed"]),
  attempt: z.number().int().positive(),
});

// prime.ts, auth.ts, reviews.ts, support.ts follow the same pattern:
// PrimePlan, Membership { memberId, plan, validTill, qrPayload }, PrimeCoupon,
// Referral { code, link, invited, joined, rewardsEarned }, BirthdayReward;
// OtpChallenge { requestId, resendAfterSeconds, expiresInSeconds },
// Session { accessToken, expiresIn, user: Customer, isNewUser };
// Review { id, author, rating, title, body, createdAt, verifiedPurchase },
// ReviewSummary { average, count, histogram[5] };
// Ticket { id, subject, category, status, orderId?, messages[] }.
```

---

## 4. API interfaces and endpoints

All POST/PATCH/DELETE carry `Idempotency-Key` (UUID). The `http` paths are the
contract the backend implements; the mock serves the same paths.

| Client | Method → endpoint | Returns |
|---|---|---|
| `ProductsApi` | `home()` → `GET /storefront/home` | banners, deals, featured categories |
| | `categories()` → `GET /catalog/categories` | `Category[]` (tree via parentId) |
| | `brands()` → `GET /catalog/brands` | `Brand[]` |
| | `list(q)` → `GET /catalog/products?category&brand&sort&cursor&limit` | `page(ProductSummary)` |
| | `get(slug)` → `GET /catalog/products/:slug` | `ProductDetail` |
| | `related(id)` → `GET /catalog/products/:id/related` | `ProductSummary[]` |
| | `availability(variantIds, pincode?)` → `GET /catalog/availability` | stock + tier price per variant |
| `SearchApi` | `search(q)` → `GET /search` | `SearchResult` |
| | `suggest(q)` → `GET /search/suggest?q` | `Suggestion[]` (≤ 8) |
| `CartApi` | `get()` → `GET /cart` | `Cart` |
| | `addItem(variantId, qty)` → `POST /cart/items` | `Cart` |
| | `setQuantity(lineId, qty)` → `PATCH /cart/items/:id` | `Cart` |
| | `removeItem(lineId)` → `DELETE /cart/items/:id` | `Cart` |
| | `applyCoupon(code)` / `removeCoupon()` → `POST/DELETE /cart/coupon` | `Cart` |
| | `merge(guestCartId)` → `POST /cart/merge` | `Cart` |
| `WishlistApi` | `list()` / `add(productId)` / `remove(productId)` → `/wishlist` | `ProductSummary[]` |
| `AddressApi` | `list/create/update/remove/setDefault` → `/me/addresses` | `Address[]` |
| | `checkPincode(pin)` → `GET /serviceability/:pincode` | `Serviceability` |
| `CheckoutApi` | `start()` → `POST /checkout` | `CheckoutSession` |
| | `setAddress(id, addressId)` / `setDelivery(id, optionId)` → `PATCH /checkout/:id` | `CheckoutSession` |
| | `placeOrder(id, method)` → `POST /checkout/:id/order` | `{ order: OrderSummary, intent: PaymentIntent \| null }` |
| `PaymentApi` | `confirm(intentId, outcome)` → `POST /payments/:id/confirm` (mock sheet) | `PaymentIntent` |
| | `status(intentId)` → `GET /payments/:id` | `PaymentIntent` (poll while pending) |
| | `retry(orderId)` → `POST /orders/:id/payments` | `PaymentIntent` (attempt + 1, same order) |
| `OrdersApi` | `list(status?, cursor)` → `GET /me/orders` | `page(OrderSummary)` |
| | `get(id)` → `GET /me/orders/:id` | `OrderDetail` |
| | `cancel(id, reason)` → `POST /me/orders/:id/cancel` | `OrderDetail` |
| | `requestReturn(id, lineIds, reason)` → `POST /me/orders/:id/returns` | `OrderDetail` |
| `AuthApi` | `requestOtp(mobile)` → `POST /auth/otp` | `OtpChallenge` |
| | `verifyOtp(requestId, code)` → `POST /auth/otp/verify` | `Session` |
| | `completeSignup(name, email?)` → `POST /auth/signup` | `Session` |
| | `login(email, password)` → `POST /auth/login` | `Session` |
| | `refresh()` / `logout()` / `me()` → `/auth/refresh`, `/auth/logout`, `/me` | `Session` / – / `Customer` |
| `PrimeApi` | `plans()` → `GET /prime/plans` | `PrimePlan[]` |
| | `membership()` → `GET /me/prime` | `Membership \| null` |
| | `purchase(planId)` → `POST /prime/subscriptions` | `{ order, intent }` |
| | `coupons()` / `referral()` / `birthdayReward()` → `GET /me/prime/{coupons,referral,birthday}` | … |
| `ReviewsApi` | `summary(productId)` / `list(productId, sort, cursor)` → `GET /catalog/products/:id/reviews` | read-only (writing reviews is not in scope) |
| `SupportApi` | `list/get/create/reply` → `/me/tickets` | `Ticket` |

`ProfileApi` (name, email, birthday) is part of `AuthApi` as `updateMe()` →
`PATCH /me`, to keep the twelve clients you listed.

---

## 5. Route map

Rendering follows Next 16 Cache Components: static shell + `use cache` for
catalog data, `generateStaticParams` for the popular set ("ISR"), per-user UI
streamed behind `<Suspense>` on the client.

| Route | What | Rendering | Index |
|---|---|---|---|
| `/` | Home: banners, deals, categories, Prime strip | static, `use cache` + `cacheLife("hours")` | yes |
| `/c/[category]` | Category listing (first page server-rendered; filters/sort client, URL-synced) | `generateStaticParams` (all ~30) | yes |
| `/search?q=` | Faceted results | static shell + client results | noindex |
| `/p/[slug]` | Product: gallery, variants, price + Prime price, stock, pincode check, reviews, related | top 60 prerendered, rest on first visit; islands for stock/price/cart | yes, JSON-LD `Product` |
| `/cart`, `/wishlist` | Cart, wishlist | client | noindex |
| `/checkout/address` → `/delivery` → `/payment` | Checkout steps (guarded) | client, login required | noindex |
| `/orders/[id]/confirmation` | Confirmation | client | noindex |
| `/login`, `/signup` | OTP / email login, signup | static shell | noindex |
| `/account`, `/account/profile`, `/account/addresses` | Account | client, login required | noindex |
| `/account/orders`, `/account/orders/[id]` | History, detail + timeline, cancel, return | client, login required | noindex |
| `/account/support`, `/account/support/[id]` | Tickets | client, login required | noindex |
| `/prime` | Plans | static | yes |
| `/prime/card`, `/prime/referrals` | QR card, coupons, referral stats | client, Prime required | noindex |
| `/offline` | Offline fallback | static | noindex |

`sitemap.xml` lists home, categories, products, `/prime`.

---

## 6. State design

**Server state: TanStack Query** (new dependency).
*Why:* cart, checkout and orders need caching, deduping, retries, optimistic
updates and mutation status; writing that by hand is where bugs come from.
Query keys live in `packages/shared/api/keys.ts`.

**Auth** (reuses the existing pattern from `features/auth`):
- Access token in memory only; refresh happens through the adapter. The mock
  keeps its "refresh cookie" in its own store key that only the mock reads.
- One refresh in flight per tab, Web Lock across tabs (as today).
- Gated actions (add to wishlist, checkout, account) open login and return to
  the same place (`?next=`), keeping the guest cart.
- Route guards are client-side (`RequireCustomer`, `RequirePrime`).
  *Why:* in mock mode the session exists only in the browser.

**Cart:**
- Server-authoritative (`CartApi`); the guest cart id is kept in localStorage.
- Optimistic quantity changes, rolled back on `409 OUT_OF_STOCK` with an inline
  "Only N left" message.
- Expiry: `expiresAt` = last change + 7 days. On `410 CART_EXPIRED`, start a
  fresh cart and say so once.
- On login: `merge(guestCartId)` sums quantities, capped by stock and
  `maxPerOrder`.

**Checkout state machine:**

```
cart ──start()──▶ address ──setAddress──▶ delivery ──setDelivery──▶ payment
                                                                      │ placeOrder(key)
          ┌───────────────────────────────────────────────────────────┘
          ▼
   intent created ──sheet──▶ succeeded ──▶ confirmation
                     │  └──▶ pending ──poll──▶ succeeded | failed
                     └─────▶ failed ──retry(orderId)──▶ new intent (same order)
```

- Each step's URL is guarded: arriving at `/checkout/payment` without an
  address redirects to `/checkout/address`.
- The idempotency key for "place order" is created when the payment step
  opens and kept in sessionStorage. A double click, a refresh or a network
  retry sends the same key, so it gets the same order back, never a second one.
- Stock is reserved when the order is placed and released if payment fails
  and isn't retried within 15 minutes (mock clock).

**Price tier:** the API returns `price` and `primePrice`; the UI shows the one
that applies (from `membership()`), and always shows the Prime price as an
upsell to non-members.

---

## 7. Mock behaviour

| Behaviour | Rule | Why |
|---|---|---|
| Latency | 300–600 ms per request (0 in unit tests) | realistic loading states |
| Random errors | 2% `500` on GETs, only when "chaos" is on (dev default on; tests off) | error states get exercised |
| Forced outcomes | Demo controls: next payment success/fail/pending, next request 500, offline | deterministic demos and tests |
| Validation | Request bodies parsed with the same zod schemas → `422` with field details | one source of truth |
| Stock | Per variant; checked on add, quantity change and place-order → `409 OUT_OF_STOCK` | the conflict path is real |
| Low-stock product | Seed has products with stock 1–3 | lets E2E trigger 409 reliably |
| Pagination | Base64 cursor, default 24, `limit` > 100 → `422` | matches backend rule |
| Idempotency | All writes need `Idempotency-Key` (`400` without). Key → stored response for 24 h; same key + different body → `422 IDEMPOTENCY_MISMATCH` | duplicate submits are safe |
| Cart TTL | 7 days from last change, against the mock clock | expiry can be demoed |
| OTP | Code `123456`; expires in 5 min; resend after 30 s, max 3; 5 wrong tries → locked 15 min (`429` + retry-after) | mirrors ADR 0005 limits |
| Payment | Sheet outcomes success / fail / pending; pending resolves after ~8 s | all three paths visible |
| Order progress | New orders advance placed → … → delivered on the mock clock; demo control "advance" | tracking timeline has something to show |
| Mock clock | `now()` = real time + offset; demo control fast-forwards | TTL / OTP / returns without waiting |
| Persistence | IndexedDB db `femxo-demo`, schema version; mismatch → reseed | survives reloads, upgrades safely |
| Reset | Demo controls → "Reset demo data" (dev and demo builds only) | quick clean slate |

**Demo controls** are a small dev-only panel (`features/devtools`), not shipped
when `NEXT_PUBLIC_API_MODE=http`. The footer always shows a "Demo data" badge
in mock mode.

---

## 8. Seed data (deterministic)

Seeded RNG (mulberry32, fixed seed) so every build and machine gets the same data.

- **Catalog:** ~200 products, 8 top categories / ~30 subcategories, ~25 brands,
  1–4 variants each (weight / pack size), MRP ≥ price ≥ Prime price, GST
  0/5/18/40%, batches with expiry, some low-stock and out-of-stock variants.
- **Images:** a generated SVG "packshot" per product, styled per category,
  rasterised by a build script with `sharp` to 800×800 WebP in
  `apps/web-customer/public/products/`; `next/image` serves AVIF/WebP with
  `srcset`. *Why:* real raster images exercise the image pipeline and LCP
  budget honestly; SVGs would bypass it.
- **Search:** synonyms (atta ↔ flour ↔ aata, chawal ↔ rice, tel ↔ oil,
  dal ↔ lentils, …); typo tolerance by edit distance (1 for 4–7 letters, 2 for
  8+); prefix matching for suggestions; facet counts over the filtered set.
- **Users (5):** new user (no orders), regular buyer (many orders, all
  statuses), Prime member (active, referrals, birthday today for the banner),
  Prime-expired user, email/password user. All `@demo.femxo.test`, fake mobiles.
- **Orders:** ~40 across every status, including failed and pending payments.
- **Coupons:** `WELCOME100` (first order, flat ₹100, min ₹499), `FLAT50`
  (min ₹299), `SAVE10` (10%, max ₹150), `PRIME15` (Prime-only, 15%, max ₹200),
  one expired, one exhausted.
- **Reviews:** ~1,500 with a realistic rating spread; verified-purchase flags.
- **Pincodes:** ~60 serviceable Bihar pincodes with ETA and COD flags, a few
  non-serviceable for the error state.

---

## 9. Cross-cutting

- **i18n:** a typed dictionary (`t("cart.empty.title")`), English now, Hindi
  later by adding `hi.ts`. *Change from P1 default #18:* the Next docs'
  dictionary pattern instead of `next-intl`. *Why:* no dependency, works with
  Cache Components and server components today; the keys are the same work.
- **States:** every data view has loading (skeleton), empty, error (retry) and
  offline variants; gated views have a login-required state.
- **Accessibility AA:** semantic landmarks, focus management in sheets and
  dialogs, 44px touch targets, colour contrast checked, axe in tests.
- **Responsive:** designed at 390 / 768 / 1280.
- **Security:** fetch wrapper with `credentials: "include"`, CSRF header slot
  (double-submit token, ready for the backend), `Idempotency-Key`, 10 s
  timeout; React escaping only (no raw HTML except escaped JSON-LD); logger
  redacts mobile numbers and emails; no secrets or real keys in code.
- **Payment sheet:** a generic "Demo payment gateway" (UPI / card /
  netbanking tabs, then success / fail / pending), with no third-party branding.

---

## 10. Test strategy

| Layer | Tool | What |
|---|---|---|
| Unit | Vitest | money and GST maths, price breakup, coupon rules, search scoring and typos, seed determinism (hash), idempotency cache, cart TTL, OTP lockout, cursor encoding |
| Contract | Vitest, adapter level | every endpoint: success bodies parse with the response schema; error envelopes and codes; `limit` > 100; idempotency replay and mismatch. The same suite can later run against `HttpAdapter` on staging to check the real API. |
| Component | Vitest + React Testing Library + fake-indexeddb | ProductCard, Price, VariantPicker, PincodeCheck, CartLine, CouponForm, OtpForm, checkout steps, order timeline, QR card; loading / empty / error states |
| Accessibility | vitest-axe (components), @axe-core/playwright (pages) | no serious or critical violations |
| End-to-end | Playwright, mock mode, chaos off, fixed seed, projects at 390 / 768 / 1280 | guest browse → OTP login → add to cart → coupon → pay (success) → tracking; payment fail → retry; stock conflict (409); duplicate submit (idempotency); plus cart expiry, payment pending, offline banner, Prime purchase → card |
| Performance | Lighthouse CI on a production build, mobile + simulated 4G | `/`, a category, a product: LCP < 2.5 s, CLS < 0.1 |

*Why no MSW:* mocking sits at the adapter, below the UI and above the network,
so the UI can't tell modes apart; MSW would add a second mock layer for no gain.

**New dependencies (all justified, nothing else):**
`@tanstack/react-query` (server state) · `idb-keyval` (tiny IndexedDB
wrapper) · `qrcode` (QR membership card) · dev: `fake-indexeddb`,
`vitest-axe`, `@axe-core/playwright`, `@lhci/cli`. `sharp` is already present
via Next and is used only by the image build script.

---

## 11. Open items

- **#3 Deployment target** (Docker host vs. platform) — needed before the
  workspace move in P4 step 1. Current evidence: `Dockerfile` +
  `output: "standalone"`, so Docker is assumed.
- The backend's `libs/contracts` is empty; these schemas are the first draft
  and should be reviewed by the backend team before Phase 3 backend work.
- Backend search is Atlas Search (ADR 0006); the mock imitates its behaviour
  (fuzzy + autocomplete + facets), not Meilisearch specifically.
