import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { createMockBackend } from "../mock/backend";
import { createAuthApi } from "./auth-api";
import { withAuth } from "./with-auth";

const NOW = Date.UTC(2026, 9, 24, 5, 0);
const MIN = 60_000;

/** An existing demo customer (Pooja, Prime) and a number nobody has used. */
const POOJA = "9000000003";
const NEWBIE = "9111111111";

let token: string | undefined;
let backend: ReturnType<typeof createMockBackend>;
let auth: ReturnType<typeof createAuthApi>;

beforeEach(() => {
  token = undefined;
  backend = createMockBackend({ storage: "memory", latency: false, realNow: () => NOW });
  auth = createAuthApi(withAuth(backend.adapter, () => token));
});

async function signInWithOtp(mobile: string) {
  const challenge = await auth.requestOtp(mobile);
  const session = await auth.verifyOtp(challenge.requestId, "123456");
  token = session.accessToken;
  return session;
}

describe("mobile OTP", () => {
  it("sends a challenge: code valid 5 minutes, resend after 30 seconds", async () => {
    await expect(auth.requestOtp(POOJA)).resolves.toMatchObject({ resendAfterSeconds: 30, expiresInSeconds: 300 });
  });

  it("rejects a mobile number that isn't Indian", async () => {
    await expect(auth.requestOtp("12345")).rejects.toMatchObject({ status: 422, code: "VALIDATION_FAILED" });
  });

  it("signs in an existing customer with the demo code", async () => {
    const session = await signInWithOtp(POOJA);
    expect(session).toMatchObject({ isNewUser: false, user: { name: "Pooja Kumari", isPrime: true } });
    expect(session.expiresIn).toBe(900);
  });

  it("marks a first-time number as a new user, ready for signup", async () => {
    const session = await signInWithOtp(NEWBIE);
    expect(session.isNewUser).toBe(true);
    expect(session.user).toMatchObject({ mobile: NEWBIE, name: "", isPrime: false });
  });

  it("counts wrong codes, then locks the number for 15 minutes", async () => {
    const { requestId } = await auth.requestOtp(POOJA);
    for (const left of [4, 3, 2, 1]) {
      await expect(auth.verifyOtp(requestId, "000000")).rejects.toMatchObject({ code: "OTP_INVALID", details: { attemptsLeft: left } });
    }
    await expect(auth.verifyOtp(requestId, "000000")).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED", retryAfterSeconds: 900 });
    // Even the right code, and a fresh request, are refused while locked.
    await expect(auth.verifyOtp(requestId, "123456")).rejects.toMatchObject({ code: "OTP_EXPIRED" });
    await expect(auth.requestOtp(POOJA)).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });

    backend.clock.advance(15 * MIN + 1000);
    await expect(signInWithOtp(POOJA)).resolves.toMatchObject({ isNewUser: false });
  });

  it("makes you wait 30 seconds to resend, and allows only 3 resends", async () => {
    await auth.requestOtp(POOJA);
    await expect(auth.requestOtp(POOJA)).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED", retryAfterSeconds: 30 });
    for (let resend = 1; resend <= 3; resend++) {
      backend.clock.advance(31_000);
      await expect(auth.requestOtp(POOJA)).resolves.toMatchObject({ resendAfterSeconds: 30 });
    }
    backend.clock.advance(31_000);
    await expect(auth.requestOtp(POOJA)).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });
  });

  it("expires the code after 5 minutes", async () => {
    const { requestId } = await auth.requestOtp(POOJA);
    backend.clock.advance(5 * MIN + 1000);
    await expect(auth.verifyOtp(requestId, "123456")).rejects.toMatchObject({ code: "OTP_EXPIRED" });
  });

  it("retires the old code when a new one is sent", async () => {
    const first = await auth.requestOtp(POOJA);
    backend.clock.advance(31_000);
    await auth.requestOtp(POOJA);
    await expect(auth.verifyOtp(first.requestId, "123456")).rejects.toMatchObject({ code: "OTP_EXPIRED" });
  });
});

describe("signup and profile", () => {
  it("needs you signed in first", async () => {
    await expect(auth.completeSignup({ name: "Asha Devi" })).rejects.toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
  });

  it("adds the name (and optional email) for a new customer", async () => {
    await signInWithOtp(NEWBIE);
    const session = await auth.completeSignup({ name: "Asha Devi", email: "asha@demo.femxo.test" });
    expect(session.user).toMatchObject({ name: "Asha Devi", email: "asha@demo.femxo.test" });
    await expect(auth.me()).resolves.toMatchObject({ name: "Asha Devi" });
  });

  it("validates the name and email", async () => {
    await signInWithOtp(NEWBIE);
    await expect(auth.completeSignup({ name: "A" })).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    await expect(auth.completeSignup({ name: "Asha Devi", email: "nope" })).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("updates the profile, including the birthday", async () => {
    await signInWithOtp(POOJA);
    await expect(auth.updateMe({ name: "Pooja K. Singh", birthday: "1992-10-24" })).resolves.toMatchObject({
      name: "Pooja K. Singh",
      birthday: "1992-10-24",
    });
    await expect(auth.updateMe({ birthday: "24/10/1992" })).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });
});

describe("email and password", () => {
  it("signs in the email customer", async () => {
    const session = await auth.login("kiran.s@demo.femxo.test", "Demo@12345");
    expect(session.user).toMatchObject({ name: "Kiran Singh", email: "kiran.s@demo.femxo.test" });
    expect(session.isNewUser).toBe(false);
  });

  it("gives one answer for a wrong password and an unknown email", async () => {
    const wrong = await auth.login("kiran.s@demo.femxo.test", "nope").catch((e: unknown) => e);
    const unknown = await auth.login("nobody@demo.femxo.test", "nope").catch((e: unknown) => e);
    expect(wrong).toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
    expect((unknown as Error).message).toBe((wrong as Error).message);
  });
});

describe("sessions", () => {
  it("answers /me only with a valid access token", async () => {
    await expect(auth.me()).rejects.toMatchObject({ status: 401 });
    await signInWithOtp(POOJA);
    await expect(auth.me()).resolves.toMatchObject({ name: "Pooja Kumari" });
  });

  it("expires the access token after 15 minutes, and refresh gives a new one from the cookie", async () => {
    await signInWithOtp(POOJA);
    backend.clock.advance(15 * MIN + 1000);
    await expect(auth.me()).rejects.toMatchObject({ status: 401 });
    const refreshed = await auth.refresh();
    token = refreshed.accessToken;
    await expect(auth.me()).resolves.toMatchObject({ name: "Pooja Kumari" });
  });

  it("can't refresh without a cookie (signed out)", async () => {
    await expect(auth.refresh()).rejects.toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
  });

  it("rotates the refresh token, and ends the whole session if an old one is used again", async () => {
    await signInWithOtp(POOJA);
    const stolen = (await backend.store.load()).refreshCookie!;
    const refreshed = await auth.refresh();
    token = refreshed.accessToken;
    expect((await backend.store.load()).refreshCookie).not.toBe(stolen);

    // The copied (already rotated) token shows up again.
    const state = await backend.store.load();
    state.refreshCookie = stolen;
    await backend.store.save(state);
    backend.adapter.controls.reload();
    await expect(auth.refresh()).rejects.toMatchObject({ status: 401 });
    await expect(auth.me()).rejects.toMatchObject({ status: 401 });
  });

  it("logs out: the access token stops working and the cookie is gone", async () => {
    await signInWithOtp(POOJA);
    await auth.logout();
    await expect(auth.me()).rejects.toMatchObject({ status: 401 });
    await expect(auth.refresh()).rejects.toMatchObject({ status: 401 });
    expect((await backend.store.load()).refreshCookie).toBeNull();
  });
});
