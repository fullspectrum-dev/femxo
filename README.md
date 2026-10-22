# FEMXO ERP web app

Next.js App Router landing pages and responsive FEMXO account-access screens.
This is the standalone FEMXO Next.js frontend. The NestJS API and worker are
separate applications.

## Requirements and local setup

- Node.js 24.15 or later.
- pnpm 11 (the workspace pins the package manager).

Run these commands from this project directory:

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Open `http://localhost:3001`. The API can run separately on its own port.
The auth routes are:

- `/register`
- `/login`
- `/verify-otp`
- `/forgot-password`
- `/reset-password`
- `/{portal}/coming-soon` after a successful sign-in (role-specific)

Successful password and OTP sign-ins show the account type on its dedicated
full-viewport coming-soon page, separate from the authentication layout. That
page is guarded by the in-memory sign-in result and
returns to the matching role login if opened directly or without a completed
sign-in in the current tab.

Development defaults to a clearly labeled, in-memory demo flow so registration
and portal screens can be tried without a server. Demo data is temporary and
never creates a real account, sends an OTP, or establishes a secure session.

## Build and production start

From this project directory:

```powershell
pnpm build
pnpm start
```

Deploy this project as a Node.js web service. Run `pnpm install` before
building, provide only public configuration at build time, and set server-only
secrets in the deployment platform's secret manager. Do not expose the NestJS
API's private credentials to this client-side app.

## Configuration

`NEXT_PUBLIC_AUTH_API_BASE_URL` is a public API origin/path, not a secret. It
defaults to `/api/auth`, which expects a same-origin backend or reverse proxy.
For a separate API, set it to an HTTPS origin and configure CORS to allow the
exact web origin and credentials. Never put API keys, private URLs, passwords,
or signing secrets in `NEXT_PUBLIC_*` variables.
`NEXT_PUBLIC_AUTH_DEMO_MODE=false` disables the demo and exercises the real API
client. Production builds disable demo auth unless
`NEXT_PUBLIC_AUTH_DEMO_MODE=true` is explicitly set at build time. Use that
setting only for a public test deployment: the prefilled credentials and demo
OTP are visible to every visitor, and anybody can enter the demo portals. Demo
mode does not authenticate real accounts and must not be used for actual
customer, dealer, or administrator access. Remove the setting and redeploy to
disable the production demo.

For a live test deployment, add `NEXT_PUBLIC_AUTH_DEMO_MODE=true` to the
hosting provider's build environment for the Production or Preview target, then
redeploy. This is a public client-side setting, not a secret. Do not enable it
on a site that is being used for real account access.

Copy `.env.example` to `.env.local` for local work. Production secrets belong
only in the backend's secret manager.

## Authentication API contract

Requests are JSON `POST`s with `credentials: "include"`, `cache: "no-store"`,
a 12-second client timeout, and no automatic retry. The server must validate
every field again. Error response bodies are deliberately not surfaced to the
user; the UI maps HTTP statuses to safe, generic messages.

| Endpoint | Request | Success response |
| --- | --- | --- |
| `POST /register` | `{ fullName, mobile, email, password, accountType, termsAccepted: true }` | `{ challengeId, expiresInSeconds, resendAfterSeconds, maskedDestination }` |
| `POST /login/otp` | `{ mobile, accountType }` | Challenge response above |
| `POST /login/password` | `{ email, password, accountType }` | `{ authenticated: true }` and a server-set session cookie |
| `POST /otp/verify` | `{ challengeId, code, purpose, accountType }` | `{ verified: true, resetGrant? }` |
| `POST /otp/resend` | `{ challengeId, purpose, accountType }` | A fresh challenge response |
| `POST /password/recovery` | `{ identifier, accountType }` | Challenge response above, with an enumeration-safe response policy |
| `POST /password/reset` | `{ resetGrant, password }` | `{ updated: true }` |

When demo mode is disabled, the API base URL includes `/api/auth`; append the
paths in the table to that base. `purpose` is `login`, `registration`, or `password_reset`. Login, OTP
verification/resend, and password-recovery requests include an `accountType`
matching the selected portal (`dealer`, `sub_dealer`, `retail_partner`,
`customer`, or `super_admin`). Public registration accepts
only `dealer`, `sub_dealer`, `retail_partner`, or `customer`; the server must
reject `super_admin` registration regardless of the client UI.

`/login` and `/register` are portal selectors. Each role then uses a separate
route (`/customer/login`, `/dealer/login`, `/sub-dealer/login`,
`/retail-partner/login`, or `/super-admin/login`) and receives a role-scoped
API request. The backend must validate that the authenticated account actually
belongs to the requested account type; this client-supplied context is not an
authorization grant.

The server must:

- Set session cookies as `HttpOnly; Secure` in production with an appropriate
  `SameSite` policy, rotate them when required, and never return session tokens
  to browser JavaScript.
- Provision Super Admin accounts only through a trusted administrative
  process or authorized invitation. Public registration must reject that role.
- Generate opaque, unpredictable, single-purpose OTP challenge IDs; expire
  challenges, limit attempts, enforce resend cooldowns and rate limits on the
  server, and invalidate superseded/consumed challenges.
- Return the same status/body/shape and comparable timing from password
  recovery whether or not an account exists. A successful recovery request
  must provide a non-enumerating challenge response, including the same
  generic `maskedDestination` string (never a contact-specific mask); deliver
  a code only when appropriate. Centralize abuse limits across backend
  replicas.
- Return a short-lived, single-use reset grant only after a valid recovery OTP.
  Bind it to the account and reset purpose, end other active sessions after a
  successful password change, and do not use the grant as a login session.
- Validate allowed origins and apply CSRF protections for cookie-authenticated
  mutations. Use HTTPS, secure headers, audit privileged account changes, and
  avoid logging passwords, OTPs, reset grants, session cookies, or raw
  identifiers.
- Record accepted terms/version and timestamps on the server; `termsAccepted`
  from the browser is not proof of consent by itself.

The OTP challenge and reset grant are held only in the auth route group's
in-memory React provider. They are intentionally not written to localStorage,
sessionStorage, cookies, URLs, or logs. Reloading or opening a new tab discards
an in-progress flow; the user can request a new code.

## Structure

```text
src/app/(auth)/                 Auth route group and shared flow provider
src/app/(auth)/{route}/         Five independent App Router pages
src/features/auth/components/   Shared auth frame, inputs, and each form
src/features/auth/schemas/      Zod client-side validation
src/features/auth/services/     Typed backend client and privacy-safe event hook
src/features/auth/types/        Account, challenge, and API types
src/features/auth/utils/        Password-strength presentation helper
tests/                           Vitest/Testing Library and Playwright specs
```

## Quality checks

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:e2e:demo
pnpm build
```

The regular Playwright flow tests disable demo mode and stub API responses to
verify the real API client interaction and route transitions. The separate
`test:e2e:demo` suite exercises the local-only demo implementation. Neither
suite validates the security or availability of a real authentication service.
Lighthouse/Core Web Vitals and load testing have not been run. A million
registered accounts is not a measured concurrency or capacity result.

## Deployment and scaling notes

Deploy the frontend behind HTTPS and a CDN for static assets. Route API calls to
a backend with horizontally scalable application instances, shared durable
identity/session storage, and centralized OTP/login rate limiting. Define
explicit timeout and availability SLOs, privacy-safe error monitoring, alerting,
and tested recovery/runbook procedures before production rollout. Do not add
client-side caching or retry authentication mutations without an idempotency
contract. Capacity claims require workload-specific load tests and monitoring;
this UI implementation does not establish backend scale.

The four demo accounts (Customer, Dealer, Sub-dealer, Super Admin) are
pre-filled on their respective sign-in pages when demo mode is enabled. Demo
password sign-in, OTP `123456`, registration, and recovery are handled by a
browser-memory-only mock. These visible sample credentials are intentionally
not secrets and must never be reused in a real environment. Super Admin demo
access is a visual preview only and grants no real privileges.
Retail Partner accounts can be created in the demo flow but do not have a
pre-seeded credential.

`reportAuthFailure` emits a `femxo:auth-failure` browser event containing only
the endpoint path, HTTP status (when available), and failure category. A
deployment may bridge this event to its approved monitoring service after
reviewing its privacy policy. No personal form value is included.
