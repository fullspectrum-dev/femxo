import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PasswordInput } from "../src/features/auth/components/PasswordInput";
import { safeNextPath } from "../src/features/auth/components/AuthSessionProvider";
import { changePasswordSchema, loginSchema } from "../src/features/auth/schemas/auth-schemas";
import {
  AuthApiError,
  createAuthClient,
  type TransportRequest,
  type TransportResponse,
} from "../src/features/auth/services/auth-client";
import { getPasswordStrength } from "../src/features/auth/utils/password-strength";
import { groupPermissions } from "../src/features/auth/utils/permissions";
import { primaryRole } from "../src/lib/roles";

const user = {
  id: "u1",
  email: "asha@example.com",
  name: "Asha Kumar",
  isSuperAdmin: false,
  status: "active",
  mustChangePassword: false,
  createdAt: "2026-10-21T09:00:00.000Z",
};

const ok = (body: unknown): TransportResponse => ({ status: 200, body });
const fail = (status: number, code: string, retryAfterSeconds?: number): TransportResponse => ({
  status,
  body: { error: { code, message: code } },
  retryAfterSeconds,
});

/** A fake backend: answers by "METHOD path", one queued response per call. */
function fakeTransport(routes: Record<string, TransportResponse[]>) {
  const calls: TransportRequest[] = [];
  const transport = vi.fn(async (request: TransportRequest) => {
    calls.push(request);
    const queue = routes[`${request.method} ${request.path}`];
    const response = queue?.shift();
    if (!response) throw new Error(`Unexpected ${request.method} ${request.path}`);
    return response;
  });
  return { transport, calls };
}

describe("auth form schemas", () => {
  it("normalises the login email and requires a password", () => {
    const parsed = loginSchema.safeParse({ email: "  Asha@Example.COM ", password: "x" });
    expect(parsed.success && parsed.data.email).toBe("asha@example.com");
    expect(loginSchema.safeParse({ email: "asha@example.com", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });

  it("applies the backend's password lengths: 8 for users, 12 for Super Admins", () => {
    const values = { currentPassword: "Temporary1", newPassword: "nine-char", confirmPassword: "nine-char" };
    expect(changePasswordSchema(false).safeParse(values).success).toBe(true);
    expect(changePasswordSchema(true).safeParse(values).success).toBe(false);
    const long = { ...values, newPassword: "x".repeat(129), confirmPassword: "x".repeat(129) };
    expect(changePasswordSchema(false).safeParse(long).success).toBe(false);
  });

  it("rejects a mismatched confirmation and an unchanged password", () => {
    const mismatch = changePasswordSchema(false).safeParse({
      currentPassword: "OldPassword1",
      newPassword: "NewPassword1",
      confirmPassword: "NewPassword2",
    });
    expect(!mismatch.success && mismatch.error.issues.map((issue) => issue.path[0])).toContain("confirmPassword");

    const unchanged = changePasswordSchema(false).safeParse({
      currentPassword: "SamePassword1",
      newPassword: "SamePassword1",
      confirmPassword: "SamePassword1",
    });
    expect(!unchanged.success && unchanged.error.issues.map((issue) => issue.path[0])).toContain("newPassword");
  });
});

describe("auth client", () => {
  it("accepts /access/me from older backends that don't send role names", async () => {
    const { transport } = fakeTransport({
      "POST /auth/refresh": [ok({ accessToken: "t", expiresIn: 900 })],
      "GET /access/me": [ok({ isSuperAdmin: false, permissions: [], territoryIds: [], locationIds: [] })],
    });
    await expect(createAuthClient(transport).access()).resolves.toMatchObject({ roles: [] });
  });

  it("logs in, then sends the access token as a Bearer header", async () => {
    const { transport, calls } = fakeTransport({
      "POST /auth/login": [ok({ accessToken: "t1", expiresIn: 900, user })],
      "GET /auth/me": [ok({ user })],
    });
    const client = createAuthClient(transport);

    await expect(client.login("asha@example.com", "pw")).resolves.toEqual(user);
    await client.me();
    expect(calls[1]).toMatchObject({ path: "/auth/me", accessToken: "t1" });
  });

  it("refreshes once and retries when the access token is rejected", async () => {
    const { transport, calls } = fakeTransport({
      "POST /auth/login": [ok({ accessToken: "old", expiresIn: 900, user })],
      "GET /auth/me": [fail(401, "UNAUTHENTICATED"), ok({ user })],
      "POST /auth/refresh": [ok({ accessToken: "new", expiresIn: 900 })],
    });
    const client = createAuthClient(transport);
    await client.login("asha@example.com", "pw");

    await expect(client.me()).resolves.toEqual(user);
    expect(calls.map((call) => call.path)).toEqual(["/auth/login", "/auth/me", "/auth/refresh", "/auth/me"]);
    expect(calls[3].accessToken).toBe("new");
  });

  it("shares one refresh between concurrent callers, since reusing a refresh token revokes the session", async () => {
    const { transport, calls } = fakeTransport({
      "POST /auth/refresh": [ok({ accessToken: "t", expiresIn: 900 })],
      "GET /auth/me": [ok({ user }), ok({ user })],
    });
    const client = createAuthClient(transport);

    await Promise.all([client.restoreSession(), client.restoreSession()]);
    expect(calls.filter((call) => call.path === "/auth/refresh")).toHaveLength(1);
  });

  it("treats a failed refresh as signed out", async () => {
    const { transport } = fakeTransport({ "POST /auth/refresh": [fail(401, "UNAUTHENTICATED")] });
    await expect(createAuthClient(transport).restoreSession()).resolves.toBeNull();
  });

  it("maps backend error codes to friendly errors and keeps Retry-After", async () => {
    const { transport } = fakeTransport({
      "POST /auth/login": [fail(401, "INVALID_CREDENTIALS"), fail(429, "TOO_MANY_ATTEMPTS", 840)],
    });
    const client = createAuthClient(transport);

    const invalid = await client.login("a@b.co", "x").catch((error: unknown) => error);
    expect(invalid).toBeInstanceOf(AuthApiError);
    expect(invalid).toMatchObject({ code: "INVALID_CREDENTIALS", status: 401 });
    expect((invalid as Error).message).not.toBe("INVALID_CREDENTIALS");

    await expect(client.login("a@b.co", "x")).rejects.toMatchObject({
      code: "TOO_MANY_ATTEMPTS",
      retryAfterSeconds: 840,
    });
  });

  it("rejects responses that don't match the backend's shape", async () => {
    const { transport } = fakeTransport({ "POST /auth/login": [ok({ token: "wrong-shape" })] });
    await expect(createAuthClient(transport).login("a@b.co", "x")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
});

describe("helpers", () => {
  it("only follows local `next` paths after sign-in", () => {
    expect(safeNextPath("/account")).toBe("/account");
    expect(safeNextPath("//evil.example")).toBe("/account");
    expect(safeNextPath("https://evil.example")).toBe("/account");
    expect(safeNextPath(null)).toBe("/account");
  });

  it("groups permissions by module with readable descriptions", () => {
    const groups = groupPermissions(["user.view", "role.view", "user.manage"]);
    expect(groups.map((group) => group.label)).toEqual(["Roles", "People"]);
    expect(groups[1].permissions[0].description).toMatch(/Create users/);
  });

  it("presents the widest recognised role, whatever the admin named it", () => {
    expect(primaryRole(true, [])?.id).toBe("super-admin");
    expect(primaryRole(false, ["Sub Dealer"])?.id).toBe("sub-dealer");
    expect(primaryRole(false, ["sub-dealer", "Dealer"])?.id).toBe("dealer");
    expect(primaryRole(false, ["Field Officer"])?.id).toBe("field-staff");
    expect(primaryRole(false, ["Accountant"])).toBeNull();
  });

  it("scores password strength progressively", () => {
    expect(getPasswordStrength("").label).toBe("Too short");
    expect(getPasswordStrength("simple").score).toBeLessThan(getPasswordStrength("SecurePass123!").score);
  });
});

describe("password visibility control", () => {
  it("toggles the password input type accessibly", async () => {
    const userEvents = userEvent.setup();
    render(<PasswordInput id="test-password" label="Password" />);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await userEvents.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    await userEvents.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });
});
