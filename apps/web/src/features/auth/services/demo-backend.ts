import type { AccessSummary, AuthUser } from "../types/auth";
import type { Transport, TransportRequest, TransportResponse } from "./auth-client";

/*
 * An in-browser stand-in for femxo-backend's /auth, /access and /territories
 * routes, for public demo deployments. It answers with the same shapes and
 * error codes, so the real client and UI run unchanged. Nothing here is
 * secure: the "session" is a sessionStorage entry.
 *
 * Production builds swap this file for demo-backend-disabled.ts (see
 * next.config.ts) unless NEXT_PUBLIC_AUTH_DEMO_MODE=true.
 */

export interface DemoAccount {
  label: string;
  hint: string;
  email: string;
  password: string;
}

interface DemoUser {
  user: AuthUser;
  password: string;
  access: Omit<AccessSummary, "isSuperAdmin">;
}

const ALL_PERMISSIONS = [
  "role.assign",
  "role.manage",
  "role.view",
  "territory.assign",
  "territory.manage",
  "territory.view",
  "user.manage",
  "user.view",
];

// Illustrative codes: real IDs are LGD codes, e.g. "district:230".
const PLACES: Record<string, { type: string; name: string; path: string[] }> = {
  "state:10": { type: "state", name: "Bihar", path: ["state:10"] },
  "district:demo-pc": { type: "district", name: "Purbi Champaran", path: ["state:10", "district:demo-pc"] },
  "subdivision:demo-rx": {
    type: "subdivision",
    name: "Raxaul",
    path: ["state:10", "district:demo-pc", "subdivision:demo-rx"],
  },
  "block:demo-rx": {
    type: "block",
    name: "Raxaul",
    path: ["state:10", "district:demo-pc", "subdivision:demo-rx", "block:demo-rx"],
  },
  "village:demo-v": {
    type: "village",
    name: "Demo village",
    path: ["state:10", "district:demo-pc", "subdivision:demo-rx", "block:demo-rx", "village:demo-v"],
  },
};

const user = (id: string, email: string, name: string, extra: Partial<AuthUser> = {}): AuthUser => ({
  id,
  email,
  name,
  isSuperAdmin: false,
  status: "active",
  mustChangePassword: false,
  createdAt: "2026-10-21T09:00:00.000Z",
  ...extra,
});

const area = (...ids: string[]) => ({ territoryIds: ids, locationIds: ids });

interface SeedEntry extends DemoUser {
  /** Shown on the sign-in page's demo picker; omitted accounts aren't listed. */
  picker?: { label: string; hint: string };
}

const SEED: SeedEntry[] = [
  {
    user: user("demo-super", "superadmin@demo.femxo.test", "Demo Super Admin", { isSuperAdmin: true }),
    password: "SuperAdminDemo123!",
    access: { permissions: ALL_PERMISSIONS, roles: [], ...area() },
    picker: { label: "Super Admin", hint: "Everything" },
  },
  {
    user: user("demo-admin", "admin@demo.femxo.test", "Demo State Admin"),
    password: "AdminDemo123!",
    access: {
      permissions: ["role.view", "territory.assign", "territory.view", "user.manage", "user.view"],
      roles: ["Admin"],
      ...area("state:10"),
    },
    picker: { label: "Admin", hint: "State" },
  },
  {
    user: user("demo-warehouse", "warehouse@demo.femxo.test", "Demo Warehouse Manager"),
    password: "WarehouseDemo123!",
    access: { permissions: [], roles: ["Warehouse Manager"], ...area() },
    picker: { label: "Warehouse", hint: "Own warehouse" },
  },
  {
    user: user("demo-dealer", "dealer@demo.femxo.test", "Demo Dealer"),
    password: "DealerDemo123!",
    access: { permissions: ["user.manage", "user.view"], roles: ["Dealer"], ...area("district:demo-pc") },
    picker: { label: "Dealer", hint: "District" },
  },
  {
    user: user("demo-field", "field@demo.femxo.test", "Demo Field Staff"),
    password: "FieldDemo123!",
    access: { permissions: [], roles: ["Field staff"], ...area("block:demo-rx") },
    picker: { label: "Field staff", hint: "Assigned area" },
  },
  {
    user: user("demo-subdealer", "subdealer@demo.femxo.test", "Demo Sub-dealer"),
    password: "SubDealerDemo123!",
    access: { permissions: [], roles: ["Sub-dealer"], ...area("village:demo-v") },
    picker: { label: "Sub-dealer", hint: "Village" },
  },
  {
    user: user("demo-customer", "customer@demo.femxo.test", "Demo Customer"),
    password: "CustomerDemo123!",
    access: { permissions: [], roles: ["Customer"], ...area() },
    picker: { label: "Customer", hint: "Self" },
  },
  {
    user: user("demo-new", "newstaff@demo.femxo.test", "Demo New Dealer", { mustChangePassword: true }),
    password: "Temporary123",
    access: { permissions: ["user.manage", "user.view"], roles: ["Dealer"], ...area("district:demo-pc") },
    picker: { label: "First sign-in", hint: "Must change password" },
  },
  {
    user: user("demo-disabled", "disabled@demo.femxo.test", "Disabled Account", { status: "disabled" }),
    password: "DisabledDemo123!",
    access: { permissions: [], roles: [], ...area() },
  },
];

export const DEMO_ACCOUNTS: DemoAccount[] = SEED.flatMap(({ picker, user: { email }, password }) =>
  picker ? [{ ...picker, email, password }] : []
);

// Versioned: bump when the seed changes, so old demo data in a tab is dropped.
const USERS_KEY = "femxo-demo-users-v2";
const SESSION_KEY = "femxo-demo-session";
const FAILURES_PER_EMAIL = 5;
const WINDOW_SECONDS = 15 * 60;
const ACCESS_TOKEN_SECONDS = 15 * 60;

const failures = new Map<string, number>();

function load<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private windows can refuse storage; the demo then forgets on reload.
  }
}

const users = () => load<DemoUser[]>(USERS_KEY, SEED);
const session = () => load<{ userId: string; token: string } | null>(SESSION_KEY, null);

const json = (status: number, body: unknown, retryAfterSeconds?: number): TransportResponse => ({
  status,
  body,
  retryAfterSeconds,
});
const fail = (status: number, code: string, message: string, retryAfterSeconds?: number) =>
  json(status, { error: { code, message } }, retryAfterSeconds);
const unauthenticated = () => fail(401, "UNAUTHENTICATED", "Authentication required");

function issue(userId: string) {
  const token = `demo.${userId}.${Math.random().toString(36).slice(2)}`;
  save(SESSION_KEY, { userId, token });
  return { accessToken: token, expiresIn: ACCESS_TOKEN_SECONDS };
}

function authenticate(request: TransportRequest, allowPendingPasswordChange = false) {
  const current = session();
  const found = current && users().find((entry) => entry.user.id === current.userId);
  if (!current || !found || request.accessToken !== current.token) return { error: unauthenticated() };
  if (found.user.mustChangePassword && !allowPendingPasswordChange) {
    return { error: fail(403, "PASSWORD_CHANGE_REQUIRED", "Change your password to continue") };
  }
  return { found };
}

function route(request: TransportRequest): TransportResponse {
  const { method, path } = request;
  const body = (request.body ?? {}) as Record<string, string>;

  if (method === "POST" && path === "/auth/login") {
    const email = String(body.email ?? "").trim().toLowerCase();
    if ((failures.get(email) ?? 0) >= FAILURES_PER_EMAIL) {
      return fail(429, "TOO_MANY_ATTEMPTS", "Too many login attempts. Try again later.", WINDOW_SECONDS);
    }
    const found = users().find((entry) => entry.user.email === email);
    if (!found || found.password !== body.password) {
      failures.set(email, (failures.get(email) ?? 0) + 1);
      return fail(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    if (found.user.status !== "active") return fail(403, "ACCOUNT_DISABLED", "This account is disabled");
    failures.delete(email);
    return json(200, { ...issue(found.user.id), user: found.user });
  }

  if (method === "POST" && path === "/auth/refresh") {
    const current = session();
    if (!current) return unauthenticated();
    return json(200, issue(current.userId));
  }

  if (method === "POST" && path === "/auth/logout") {
    save(SESSION_KEY, null);
    return json(204, null);
  }

  if (method === "GET" && path === "/auth/me") {
    const { found, error } = authenticate(request, true);
    return error ?? json(200, { user: found.user });
  }

  if (method === "POST" && path === "/auth/password") {
    const { found, error } = authenticate(request, true);
    if (error) return error;
    if (found.password !== body.currentPassword) return fail(400, "WRONG_PASSWORD", "The current password is wrong");
    const min = found.user.isSuperAdmin ? 12 : 8;
    const next = String(body.newPassword ?? "");
    if (next.length < min || next.length > 128) {
      return fail(400, "WEAK_PASSWORD", `Password must be ${min}-128 characters long`);
    }
    if (next === body.currentPassword) return fail(400, "PASSWORD_UNCHANGED", "The new password must be different");
    save(
      USERS_KEY,
      users().map((entry) =>
        entry.user.id === found.user.id
          ? { ...entry, password: next, user: { ...entry.user, mustChangePassword: false } }
          : entry
      )
    );
    return json(204, null);
  }

  if (method === "GET" && path === "/access/me") {
    const { found, error } = authenticate(request);
    return error ?? json(200, { isSuperAdmin: found.user.isSuperAdmin, ...found.access });
  }

  if (method === "GET" && path.startsWith("/territories/")) {
    const { error } = authenticate(request);
    if (error) return error;
    const id = decodeURIComponent(path.slice("/territories/".length));
    const place = PLACES[id];
    if (!place) return fail(404, "TERRITORY_NOT_FOUND", "Territory not found");
    return json(200, {
      territory: { id, type: place.type, name: place.name },
      ancestors: place.path.slice(0, -1).map((ancestorId) => ({
        id: ancestorId,
        type: PLACES[ancestorId].type,
        name: PLACES[ancestorId].name,
      })),
    });
  }

  return fail(404, "NOT_FOUND", "Not found");
}

export const demoTransport: Transport = async (request) => {
  // A short pause, so loading states are visible as they are against the API.
  await new Promise((resolve) => setTimeout(resolve, 350));
  return route(request);
};
