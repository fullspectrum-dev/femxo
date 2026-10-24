import { expect, test } from "@playwright/test";

test("the demo controls open from the page and reset keeps the store usable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Demo controls" }).click();
  const panel = page.getByRole("dialog", { name: "Demo controls" });
  await expect(panel).toBeVisible();

  await panel.getByRole("button", { name: "Fast-forward 7 days" }).click();
  await expect(panel.getByText("+7 days ahead")).toBeVisible();

  await panel.getByRole("button", { name: "Reset demo data" }).click();
  await panel.getByRole("button", { name: "Yes, reset" }).click();
  await expect(panel.getByText("Real time")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
