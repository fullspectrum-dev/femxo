import { expect, test } from "@playwright/test";

const demoLogins = [
  {
    slug: "customer",
    heading: "Customer sign in",
    email: "customer@demo.femxo.test",
    password: "CustomerDemo123!",
  },
  {
    slug: "dealer",
    heading: "Dealer sign in",
    email: "dealer@demo.femxo.test",
    password: "DealerDemo123!",
  },
  {
    slug: "sub-dealer",
    heading: "Sub-dealer sign in",
    email: "subdealer@demo.femxo.test",
    password: "SubDealerDemo123!",
  },
  {
    slug: "super-admin",
    heading: "Super Admin sign in",
    email: "superadmin@demo.femxo.test",
    password: "SuperAdminDemo123!",
  },
] as const;

test("pre-fills and accepts demo credentials for the four portals", async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const portal of demoLogins) {
    await page.goto(`/${portal.slug}/login`);
    await expect(page.getByRole("heading", { name: portal.heading })).toBeVisible();
    await expect(page.getByLabel("Email address")).toHaveValue(portal.email);
    await expect(page.locator("#login-password")).toHaveValue(portal.password);
    await expect(
      page.getByRole("note", { name: "Demo mode notice" })
    ).toContainText("No real account or secure session is created");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/${portal.slug}/coming-soon$`),
      { timeout: 15_000 }
    );
    await expect(page.locator(".coming-soon-eyebrow")).toContainText(
      `Demo access · ${portal.heading.replace(" sign in", "")}`
    );
    await expect(page.locator(".coming-soon-security")).toContainText(
      "No real account is signed in"
    );
    await expect(
      page.getByRole("heading", { name: "Something thoughtful is on its way." })
    ).toBeVisible();
  }
});

test("registration finishes in demo mode with the visible demo code", async ({
  page,
}) => {
  await page.goto("/dealer/register");
  await page.getByLabel("Full name").fill("Demo-created Dealer");
  await page.getByLabel("Mobile number").fill("9876543299");
  await page.getByLabel("Email address").fill("created.dealer@demo.femxo.test");
  await page.getByLabel("Create password").fill("CreatedDealer123!");
  await page.getByLabel("Confirm password").fill("CreatedDealer123!");
  await page.getByLabel("I agree to FEMXO's terms of service and privacy policy.").check();
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/verify-otp$/, { timeout: 15_000 });
  await expect(page.getByText(/Demo mode: use the test verification code 123456/)).toBeVisible();
  const digits = page.getByRole("group", { name: "6-digit verification code" });
  await expect(
    digits.getByRole("textbox", { name: "Verification code digit 1" })
  ).toHaveValue("1");
  await page.getByRole("button", { name: "Verify code" }).click();
  await expect(
    page.getByRole("status").filter({
      hasText: "Demo account created in memory for this session only",
    })
  ).toBeVisible();
});
