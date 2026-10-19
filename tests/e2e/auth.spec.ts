import { expect, test } from "@playwright/test";

const challengeResponse = {
  challengeId: "e2e-challenge-id",
  expiresInSeconds: 300,
  resendAfterSeconds: 30,
  maskedDestination: "+91 ••••••3210",
};

test("auth portals render without horizontal overflow", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const routes = [
    ["/customer/register", "Create your customer account"],
    ["/dealer/register", "Create your Dealer account"],
    ["/customer/login", "Customer sign in"],
    ["/dealer/login", "Dealer sign in"],
    ["/sub-dealer/login", "Sub-dealer sign in"],
    ["/retail-partner/login", "Retail Partner sign in"],
    ["/super-admin/login", "Super Admin sign in"],
    ["/verify-otp", "Check your messages"],
    ["/customer/forgot-password", "Let’s get you back in"],
    ["/reset-password", "Choose a new password"],
  ] as const;

  await page.setViewportSize({ width: 360, height: 900 });
  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    const hasNoHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(hasNoHorizontalOverflow, `${route} overflows at 360px`).toBe(true);
  }

  const representativeRoutes = [
    ["/customer/login", "Customer sign in"],
    ["/dealer/login", "Dealer sign in"],
    ["/customer/register", "Create your customer account"],
  ] as const;
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, heading] of representativeRoutes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      const hasNoHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(hasNoHorizontalOverflow, `${route} overflows at ${width}px`).toBe(
        true
      );
    }
  }
});

test("portal chooser separates customer, partner, and provisioned admin access", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page.getByRole("link", { name: /Customer/ })).toHaveAttribute(
    "href",
    "/customer/login"
  );
  await expect(page.getByRole("link", { name: /Dealer/ })).toHaveAttribute(
    "href",
    "/dealer/login"
  );
  await expect(page.getByRole("link", { name: /Sub-dealer/ })).toHaveAttribute(
    "href",
    "/sub-dealer/login"
  );
  await expect(page.getByRole("link", { name: /Retail Partner/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Super Admin/ })).toContainText(
    "invitation required"
  );
  await page.goto("/register");
  await expect(page.getByRole("link", { name: /Customer/ })).toHaveAttribute(
    "href",
    "/customer/register"
  );
  await expect(page.getByRole("link", { name: /^Admin/ })).toHaveAttribute(
    "href",
    "/super-admin/login"
  );
  await expect(page.getByRole("link", { name: /^Admin/ })).toContainText(
    "invitation required"
  );
  await expect(page.getByRole("link", { name: /Retail Partner/ })).toHaveCount(0);
  await page.goto("/forgot-password");
  await expect(
    page.getByRole("link", { name: /Retail Partner/ })
  ).toHaveAttribute("href", "/retail-partner/forgot-password");
  await page.goto("/retail-partner/login");
  await expect(
    page.getByRole("heading", { name: "Retail Partner sign in" })
  ).toBeVisible();
});

test("public role registration is fixed to its own account type", async ({
  page,
}) => {
  await page.goto("/dealer/register");
  const accountType = page.locator(".auth-account-type");
  await expect(accountType).toContainText("Dealer");
  await expect(accountType.locator("select")).toHaveCount(0);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByText("Enter your full name.", { exact: true })
  ).toBeVisible();
});

test("theme preference applies on auth screens without persisting auth data", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("femxo-theme", "light");
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();

  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.getByRole("button", { name: "Switch to light mode" })
  ).toBeVisible();
  const storedKeys = await page.evaluate(() => Object.keys(localStorage));
  expect(storedKeys).toEqual(["femxo-theme"]);
});

test("mobile OTP sign-in verifies a pasted six-digit code", async ({ page }) => {
  const initialChallenge = { ...challengeResponse, resendAfterSeconds: 0 };
  await page.route("**/api/auth/login/otp", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      mobile: "9876543210",
      accountType: "customer",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(initialChallenge),
    });
  });
  await page.route("**/api/auth/otp/resend", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      challengeId: initialChallenge.challengeId,
      purpose: "login",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...challengeResponse,
        challengeId: "resent-e2e-challenge-id",
      }),
    });
  });
  await page.route("**/api/auth/otp/verify", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      challengeId: "resent-e2e-challenge-id",
      code: "123456",
      purpose: "login",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ verified: true }),
    });
  });

  await page.goto("/customer/login");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByRole("button", { name: "Continue with mobile" }).click();
  await expect(page).toHaveURL(/\/verify-otp$/);
  await expect(page.getByText(/sent to \+91/)).toBeVisible();

  const digits = page.getByRole("group", { name: "6-digit verification code" });
  await page.getByRole("button", { name: "Resend code" }).click();
  await page.evaluate(() => navigator.clipboard.writeText("123456"));
  await digits
    .getByRole("textbox", { name: "Verification code digit 1" })
    .focus();
  await page.keyboard.press("Control+V");
  await page.getByRole("button", { name: "Verify code" }).click();
  await expect(page).toHaveURL(/\/customer\/coming-soon$/);
  await expect(page.locator(".coming-soon-security")).toContainText(
    "signed in to the Customer experience"
  );
});

test("password recovery verifies OTP and updates the password through the API", async ({
  page,
}) => {
  await page.route("**/api/auth/password/recovery", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      identifier: "asha@example.com",
      accountType: "customer",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(challengeResponse),
    });
  });
  await page.route("**/api/auth/otp/verify", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      challengeId: challengeResponse.challengeId,
      code: "654321",
      purpose: "password_reset",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ verified: true, resetGrant: "e2e-short-lived-grant" }),
    });
  });
  await page.route("**/api/auth/password/reset", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      resetGrant: "e2e-short-lived-grant",
      password: "NewSecurePass123",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ updated: true }),
    });
  });

  await page.goto("/customer/forgot-password");
  await page.getByLabel("Mobile number or email").fill("asha@example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/verify-otp$/);
  const digits = page.getByRole("group", { name: "6-digit verification code" });
  for (const [index, digit] of Array.from("654321").entries()) {
    await digits.getByRole("textbox", { name: `Verification code digit ${index + 1}` }).fill(digit);
  }
  await page.getByRole("button", { name: "Verify code" }).click();
  await expect(page).toHaveURL(/\/reset-password$/);

  await page.getByRole("textbox", { name: "New password", exact: true }).fill(
    "NewSecurePass123"
  );
  await page
    .getByRole("textbox", { name: "Confirm new password", exact: true })
    .fill("NewSecurePass123");
  await page.getByRole("button", { name: "Reset password & sign in" }).click();
  await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();
});
