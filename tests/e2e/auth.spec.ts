import { expect, test, type Page, type Route } from "@playwright/test";

// Runs with demo mode off, against a mocked femxo-backend: page.route answers
// /auth, /access and /territories the way the real API does.

const baseUser = {
  id: "665f00000000000000000001",
  email: "asha@example.com",
  name: "Asha Kumar",
  isSuperAdmin: false,
  status: "active",
  mustChangePassword: false,
  createdAt: "2026-10-21T09:00:00.000Z",
};

const json = (route: Route, status: number, body: unknown, headers: Record<string, string> = {}) =>
  route.fulfill({ status, contentType: "application/json", headers, body: JSON.stringify(body) });
const apiError = (route: Route, status: number, code: string, headers?: Record<string, string>) =>
  json(route, status, { error: { code, message: code } }, headers);

interface MockOptions {
  mustChangePassword?: boolean;
  loginError?: { status: number; code: string; headers?: Record<string, string> };
  passwordError?: { status: number; code: string };
}

/** A tiny stateful backend: a session exists after login, until logout. */
async function mockBackend(page: Page, options: MockOptions = {}) {
  const state = { signedIn: false, user: { ...baseUser, mustChangePassword: Boolean(options.mustChangePassword) } };
  const calls: string[] = [];

  await page.route(/\/(auth|access|territories)\//, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    calls.push(`${request.method()} ${path}`);

    switch (`${request.method()} ${path}`) {
      case "POST /auth/login":
        if (options.loginError) {
          return apiError(route, options.loginError.status, options.loginError.code, options.loginError.headers);
        }
        state.signedIn = true;
        return json(route, 200, { accessToken: "token", expiresIn: 900, user: state.user });
      case "POST /auth/refresh":
        return state.signedIn
          ? json(route, 200, { accessToken: "token", expiresIn: 900 })
          : apiError(route, 401, "UNAUTHENTICATED");
      case "POST /auth/logout":
        state.signedIn = false;
        return route.fulfill({ status: 204 });
      case "GET /auth/me":
        return json(route, 200, { user: state.user });
      case "POST /auth/password":
        if (options.passwordError) return apiError(route, options.passwordError.status, options.passwordError.code);
        state.user = { ...state.user, mustChangePassword: false };
        return route.fulfill({ status: 204 });
      case "GET /access/me":
        return json(route, 200, {
          isSuperAdmin: false,
          permissions: ["user.manage", "user.view"],
          roles: ["Dealer"],
          territoryIds: ["district:230"],
          locationIds: ["district:230"],
        });
      case "GET /territories/district%3A230":
      case "GET /territories/district:230":
        return json(route, 200, {
          territory: { id: "district:230", type: "district", name: "Purbi Champaran" },
          ancestors: [{ id: "state:10", type: "state", name: "Bihar" }],
        });
      default:
        return apiError(route, 404, "NOT_FOUND");
    }
  });
  return calls;
}

async function signIn(page: Page, password = "CorrectHorse1") {
  await page.getByLabel("Email address").fill(baseUser.email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

test("auth pages fit every screen width", async ({ page }) => {
  test.setTimeout(120_000);
  await mockBackend(page);
  const routes = [
    ["/login", "Sign in to Femxo"],
    ["/forgot-password", "Forgot your password?"],
  ] as const;

  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, heading] of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(fits, `${route} overflows at ${width}px`).toBe(true);
    }
  }
});

test("old per-portal and sign-up routes lead to the single sign-in", async ({ page }) => {
  await mockBackend(page);
  for (const route of ["/dealer/login", "/super-admin/login", "/register", "/verify-otp"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
  }
  await page.goto("/reset-password");
  await expect(page).toHaveURL(/\/forgot-password$/);
});

test("signs in, shows role and territory, and signs out", async ({ page }) => {
  const calls = await mockBackend(page);
  await page.goto("/login");
  await signIn(page);

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dealer Hub");
  await expect(page.getByText("Order at dealer price").first()).toBeVisible();
  await expect(page.getByText("Create users, edit them, disable them, and reset their passwords")).toBeVisible();
  await expect(page.getByText("Bihar › Purbi Champaran")).toBeVisible();

  // The session survives a reload through the refresh cookie.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dealer Hub");
  expect(calls).toContain("POST /auth/refresh");

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
  expect(calls).toContain("POST /auth/logout");
});

test("shows backend errors, including a lockout countdown", async ({ page }) => {
  await mockBackend(page, { loginError: { status: 401, code: "INVALID_CREDENTIALS" } });
  await page.goto("/login");
  await signIn(page, "wrong-password");
  await expect(page.getByRole("alert").filter({ hasText: "don't match" })).toBeVisible();

  await page.unrouteAll();
  await mockBackend(page, {
    loginError: { status: 429, code: "TOO_MANY_ATTEMPTS", headers: { "Retry-After": "900" } },
  });
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: /Try again in 1[45]:\d\d/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeDisabled();
});

test("a temporary password must be changed before anything else", async ({ page }) => {
  await mockBackend(page, { mustChangePassword: true });
  await page.goto("/login");
  await signIn(page, "Temporary123");

  await expect(page).toHaveURL(/\/change-password$/);
  await expect(page.getByText("Your admin set a temporary password.")).toBeVisible();

  // The account page sends them back until it's done.
  await page.goto("/account");
  await expect(page).toHaveURL(/\/change-password$/);

  await page.getByLabel("Temporary password").fill("Temporary123");
  await page.getByLabel("New password", { exact: true }).fill("MyOwnPassword9");
  await page.getByLabel("Confirm new password").fill("MyOwnPassword9");
  await page.getByRole("button", { name: "Change password" }).click();

  await expect(page).toHaveURL(/\/account\?passwordChanged=1$/);
  await expect(page.getByText("Password changed.")).toBeVisible();
});

test("a wrong current password is reported on its field", async ({ page }) => {
  await mockBackend(page, { mustChangePassword: true, passwordError: { status: 400, code: "WRONG_PASSWORD" } });
  await page.goto("/login");
  await signIn(page, "Temporary123");
  await expect(page).toHaveURL(/\/change-password$/);

  await page.getByLabel("Temporary password").fill("not-it");
  await page.getByLabel("New password", { exact: true }).fill("MyOwnPassword9");
  await page.getByLabel("Confirm new password").fill("MyOwnPassword9");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.locator("#current-password-error")).toHaveText("Your current password is wrong.");
});

test("signed-out visitors to the account page are sent to sign in", async ({ page }) => {
  await mockBackend(page);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
});
