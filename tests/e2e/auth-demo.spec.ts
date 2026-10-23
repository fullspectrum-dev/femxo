import { expect, test } from "@playwright/test";

// Runs with NEXT_PUBLIC_AUTH_DEMO_MODE=true: no backend, the in-browser demo
// answers with the same contract.

// The Super Admin lands in the admin panel instead (admin-demo.spec.ts).
const ROLE_WORKSPACES = [
  ["Admin", "State Operations"],
  ["Warehouse", "Warehouse Desk"],
  ["Dealer", "Dealer Hub"],
  ["Field staff", "Field App"],
  ["Sub-dealer", "Village Store"],
  ["Customer", "Femxo Store"],
] as const;

test("every role's demo account opens its own coming-soon workspace", async ({ page }) => {
  test.setTimeout(120_000);
  for (const [label, workspace] of ROLE_WORKSPACES) {
    await page.goto("/login");
    await expect(page.getByRole("note", { name: "Demo mode notice" })).toBeVisible();
    await page.getByRole("button", { name: new RegExp(`^${label}\\b`) }).click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(workspace);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  }
});

test("the dealer sees their district", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /^Dealer\b/ }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Bihar › Purbi Champaran")).toBeVisible();
});

test("the first-sign-in demo account must choose a new password", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /First sign-in/ }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/change-password$/);

  await page.getByLabel("Temporary password").fill("Temporary123");
  await page.getByLabel("New password", { exact: true }).fill("MyOwnPassword9");
  await page.getByLabel("Confirm new password").fill("MyOwnPassword9");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page).toHaveURL(/\/account\?passwordChanged=1$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dealer Hub");
});

test("wrong demo passwords get the backend's error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("dealer@demo.femxo.test");
  await page.getByLabel("Password", { exact: true }).fill("not-the-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "don't match" })).toBeVisible();
});
