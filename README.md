# Femxo web app

The Femxo website and account screens: a Next.js App Router frontend for
[femxo-backend](../femxo-backend). The landing page explains the network; signed-in
users get a role-based workspace page (announced as coming soon) built from
what the backend says about their role and territory.

## Requirements and local setup

- Node.js 24.15 or later.
- pnpm 11.20 (pinned for the Docker image too).

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Open `http://localhost:3001`. The site runs on **dummy data** (demo mode) by
default, locally and in production: sign-in runs in the browser with test
accounts and no backend is called. To connect femxo-backend later, start it,
set `NEXT_PUBLIC_AUTH_DEMO_MODE=false` and `FEMXO_API_ORIGIN`, and rebuild.
Restart `pnpm dev` after changing `next.config.ts` or `.env.local`.

## Routes

| Route | What it is |
|---|---|
| `/` | Landing page |
| `/careers` | Careers |
| `/login` | One sign-in for every role (email and password) |
| `/change-password` | Required after an admin sets a temporary password; also voluntary |
| `/forgot-password` | Explains that admins reset passwords (the backend has no self-service reset) |
| `/account` | The signed-in user's workspace for their role, plus their current access |

Old URLs (`/register`, `/verify-otp`, `/reset-password`, `/{portal}/login` and so
on) redirect to these.

## Configuration

| Variable | When | Purpose |
|---|---|---|
| `FEMXO_API_ORIGIN` | build | Where femxo-backend runs. Once connected, the site forwards `/auth`, `/access` and `/territories` to it. Default `http://localhost:3000`. |
| `NEXT_PUBLIC_API_BASE_URL` | build | Optional. Call the API origin directly instead of through the forwarding. |
| `NEXT_PUBLIC_AUTH_DEMO_MODE` | build | Leave unset for dummy data (the default everywhere). Set `false` to connect the backend. |

All three are read at build time: rewrites and `NEXT_PUBLIC_*` values are baked
into the build. None of them is a secret; never put secrets in `NEXT_PUBLIC_*`.

**Why the forwarding.** The backend's refresh token cookie is `Path=/auth`,
`SameSite=Strict`, `Secure`, `httpOnly`. Serving `/auth` from this site's origin
keeps it first-party with no CORS setup. If you use `NEXT_PUBLIC_API_BASE_URL`
instead, the API must be on the same site (e.g. `api.femxo.com` for `femxo.com`)
and list this site in its `CORS_ORIGINS`.

**Rate limits behind the forwarding.** The backend limits login attempts per
client IP. Through the forwarding, requests reach it from this server, so set the
backend's `TRUST_PROXY_HOPS` to count every proxy in front of it (load balancer
*and* this server), or every user shares one limit.

## Backend contract

The client ([auth-client.ts](src/features/auth/services/auth-client.ts)) uses:

| Endpoint | Use |
|---|---|
| `POST /auth/login` | `{ email, password }` → `{ accessToken, expiresIn, user }` and the refresh cookie |
| `POST /auth/refresh` | Cookie → new `{ accessToken, expiresIn }`; the cookie rotates |
| `POST /auth/logout` | Ends the session |
| `GET /auth/me` | The user, including `mustChangePassword` |
| `POST /auth/password` | `{ currentPassword, newPassword }`; signs out other sessions |
| `GET /access/me` | `{ isSuperAdmin, permissions, roles, territoryIds, locationIds }` |
| `GET /territories/:id` | A location and its ancestors, for breadcrumbs |

Errors are `{ error: { code, message } }`; the client maps each code
(`INVALID_CREDENTIALS`, `TOO_MANY_ATTEMPTS` with `Retry-After`, `WRONG_PASSWORD`,
…) to a friendly message. The access token lives only in memory. Refreshes are
single-flight and serialised across tabs with a Web Lock, because the backend
revokes the whole session when a rotated refresh token is reused.

The workspace page picks a role from `roles` by name ([roles.ts](src/lib/roles.ts));
a role with an unrecognised name gets a generic workspace.

## Demo accounts

With demo mode on, `/login` offers one account per role (Super Admin, Admin,
Warehouse, Dealer, Field staff, Sub-dealer, Customer) and a "First sign-in"
account that must change its password. The demo
([demo-backend.ts](src/features/auth/services/demo-backend.ts)) answers with the
backend's shapes and error codes. Its passwords are public and grant nothing.
Once the backend is connected (`NEXT_PUBLIC_AUTH_DEMO_MODE=false`), production
builds replace it with a stub, so the demo accounts don't ship alongside real ones.

## Quality checks

```powershell
pnpm lint
pnpm typecheck
pnpm test                         # unit tests (Vitest)
pnpm exec playwright install chromium
pnpm test:e2e                     # mocked backend, demo off (port 3011)
pnpm test:e2e:demo                # demo mode (port 3012)
pnpm test:e2e:demo:production     # demo mode on a production build
pnpm build
```

## Deployment

`pnpm build` produces a self-contained server in `.next/standalone`
(`output: "standalone"`). With Docker:

```powershell
docker build -t femxo-frontend --build-arg FEMXO_API_ORIGIN=http://api:3000 .
docker run -p 3001:3001 femxo-frontend
```

Without Docker, copy the assets next to the server and run it:

```powershell
pnpm build
Copy-Item -Recurse public .next/standalone/
Copy-Item -Recurse .next/static .next/standalone/.next/
$env:PORT = 3001; node .next/standalone/server.js
```

Serve it over HTTPS (the refresh cookie is `Secure`). Every response carries
`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
`Permissions-Policy` and `Strict-Transport-Security`. There is no
Content-Security-Policy yet: the theme script in `app/layout.tsx` is inline and
needs a nonce first.

`reportAuthFailure` emits a `femxo:auth-failure` browser event with only the
endpoint, status and failure kind (no form values), for wiring to monitoring.
