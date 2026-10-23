import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// The admin panel prototype on dummy data (NEXT_PUBLIC_AUTH_DEMO_MODE=true).

async function signIn(page: Page, role: string, next = "/admin/dashboard") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByRole("button", { name: new RegExp(`^${role}\\b`) }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

test("the Super Admin lands on the dashboard with every module in the sidebar", async ({ page }) => {
  await signIn(page, "Super Admin");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Admin modules" }).getByRole("link")).toHaveCount(17);
  await expect(page.getByText("Prototype mode")).toBeVisible();
});

test("the date range drives every figure, and each chart reads by keyboard or as a table", async ({ page }) => {
  await signIn(page, "Super Admin");
  const hero = page.locator(".fx-hero-figure");
  await expect(hero).toHaveText("₹6.7 Cr");
  await page.getByRole("button", { name: "90D", exact: true }).click();
  await expect(hero).toHaveText("₹18.6 Cr");
  await expect(page.getByText("vs previous 90 days").first()).toBeVisible();

  // Keyboard twin of hover: arrow keys move the crosshair and show the readout.
  const trend = page.getByRole("group", { name: /^Gross sales, Last 90 days/ });
  await trend.focus();
  await page.keyboard.press("End");
  await expect(trend.getByText("This period")).toBeVisible();

  // Every chart has a table view with the same numbers.
  await page.getByRole("button", { name: "Show Gross sales as a table" }).click();
  await expect(page.getByRole("table", { name: "Gross sales" }).getByRole("row")).toHaveCount(14);
  await page.getByRole("button", { name: "Show Gross sales as a chart" }).click();
  await expect(trend).toBeVisible();
});

test("signing in as Super Admin without a `next` opens the admin panel", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /^Super Admin\b/ }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
});

test("signing in from /account (next=/account) still opens the admin panel for the Super Admin", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
  await page.getByRole("button", { name: /^Super Admin\b/ }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
});

test("dealer KYC: approve, then allocate territory", async ({ page }) => {
  await signIn(page, "Super Admin", "/admin/dealers");
  await page.getByRole("searchbox", { name: "Search" }).fill("Kosi");
  const row = page.getByRole("row", { name: /Kosi Distribution Co\./ });
  await row.getByRole("button", { name: "View" }).click();

  const drawer = page.getByRole("dialog", { name: /Kosi Distribution Co\./ });
  await expect(drawer.getByText("Four-eyes rule")).toBeVisible();
  await drawer.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("status").getByText("Dealer approved. Written to audit log.")).toBeVisible();

  await drawer.getByRole("button", { name: "Allocate territory" }).click();
  await expect(drawer.getByText("Active", { exact: true })).toBeVisible();
});

test("settlement release names the amount and needs explicit confirmation", async ({ page }) => {
  await signIn(page, "Super Admin", "/admin/finance");
  await page.getByRole("row", { name: /ST-2210/ }).getByRole("button", { name: "View" }).click();
  const drawer = page.getByRole("dialog", { name: /ST-2210/ });
  await drawer.getByRole("button", { name: "Approve" }).click();
  await drawer.getByRole("button", { name: "Release payment" }).click();

  const confirm = page.getByRole("dialog", { name: "Confirm financial action" });
  await expect(confirm.getByText("₹1,24,000")).toBeVisible();
  const release = confirm.getByRole("button", { name: "Confirm and release" });
  await expect(release).toBeDisabled();
  await confirm.getByRole("checkbox", { name: "I understand this cannot be undone." }).check();
  await release.click();
  await expect(page.getByRole("status").getByText(/ST-2210 released/)).toBeVisible();
});

test("forms validate inline before saving", async ({ page }) => {
  await signIn(page, "Super Admin", "/admin/dealers");
  await page.getByRole("button", { name: "Add dealer" }).first().click();
  const form = page.getByRole("dialog", { name: "Add dealer" });
  await form.getByLabel("GSTIN").fill("gst12");
  await form.getByLabel("GSTIN").blur();
  await expect(form.getByText("Enter a valid 15-character GSTIN.")).toBeVisible();
  await expect(form.getByLabel("GSTIN")).toHaveValue("GST12");
});

test("previewable system states", async ({ page }) => {
  await signIn(page, "Super Admin", "/admin/dealers?state=empty");
  await expect(page.getByText("No dealers yet")).toBeVisible();
  await page.goto("/admin/products?state=error");
  await expect(page.getByText("Couldn’t load data")).toBeVisible();
  await page.goto("/admin/orders?state=denied");
  await expect(page.getByText("Access denied")).toBeVisible();
});

test("a quick action opens its form even on the module already shown, and leaves the panel usable", async ({ page }) => {
  await signIn(page, "Super Admin", "/admin/dealers");
  await expect(page.getByRole("row", { name: /Anand Agencies/ })).toBeVisible();
  await page.getByRole("button", { name: "Quick actions" }).click();
  await page.getByRole("link", { name: "Add dealer" }).click();
  const form = page.getByRole("dialog", { name: "Add dealer" });
  await expect(form).toBeVisible();
  await form.getByRole("button", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/admin\/dealers$/);

  // A form on another module, closed just before navigating away, must not
  // leave an invisible modal behind on the hidden page.
  await page.getByRole("button", { name: "Quick actions" }).click();
  await page.getByRole("link", { name: "New stock transfer" }).click();
  await expect(page.getByRole("dialog", { name: "New stock transfer" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Transfers" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
  await page.getByRole("navigation", { name: "Admin modules" }).getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(page.getByRole("region", { name: "Notifications" })).toBeVisible();
});

test("the sidebar collapses to an icon rail, resizes by dragging, and remembers both", async ({ page }) => {
  await signIn(page, "Super Admin", "/admin/dealers");
  const aside = page.getByRole("complementary", { name: "Sidebar" });
  const width = async () => Math.round((await aside.boundingBox())!.width);
  await expect.poll(width).toBe(272);

  // Drag the edge wider, then past the snap point into the rail.
  const sash = page.getByRole("separator", { name: "Resize sidebar" });
  const drag = async (toX: number) => {
    const box = (await sash.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, 400);
    await page.mouse.down();
    await page.mouse.move(toX, 400, { steps: 6 });
    await page.mouse.up();
  };
  await drag(340);
  await expect.poll(width).toBe(340);
  await drag(90);
  await expect.poll(width).toBe(72);
  await expect(aside.getByRole("link", { name: /^Dealers\b/ })).toHaveAttribute("title", "Dealers · 7 waiting");

  await page.reload();
  await expect.poll(width).toBe(72);
  await page.keyboard.press("Control+b");
  await expect.poll(width).toBe(340);
  await expect(page.getByRole("button", { name: "Collapse sidebar" }).first()).toBeVisible();
});

test("light and dark mode switch from the top bar and stay chosen", async ({ page }) => {
  await signIn(page, "Super Admin");
  const html = page.locator("html");
  const wasDark = await html.evaluate((el) => el.classList.contains("dark"));
  await page.getByRole("button", { name: wasDark ? "Switch to light mode" : "Switch to dark mode" }).click();
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
  await page.reload();
  await expect(page.getByRole("button", { name: wasDark ? "Switch to dark mode" : "Switch to light mode" })).toBeVisible();
});

test.describe("on a tablet", () => {
  test.use({ viewport: { width: 900, height: 1000 } });

  test("☰ expands the sidebar in place and the page reflows beside it", async ({ page }) => {
    await signIn(page, "Super Admin", "/admin/warehouse");
    const aside = page.getByRole("complementary", { name: "Sidebar" });
    const main = page.locator("#admin-main");
    const left = async (locator: typeof main) => Math.round((await locator.boundingBox())!.x);
    await expect.poll(async () => Math.round((await aside.boundingBox())!.width)).toBe(72);

    await page.locator(".fx-topbar").getByRole("button", { name: "Expand sidebar" }).click();
    await expect.poll(async () => Math.round((await aside.boundingBox())!.width)).toBe(272);
    await expect.poll(() => left(main)).toBe(272);
    // Not an overlay: the page stays usable and never scrolls sideways.
    await expect(page.getByRole("dialog", { name: "Navigation" })).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await page.getByRole("tab", { name: "Transfers" }).click();
    await expect(page.getByRole("tab", { name: "Transfers" })).toHaveAttribute("aria-selected", "true");

    await page.locator(".fx-topbar").getByRole("button", { name: "Collapse sidebar" }).click();
    await expect.poll(() => left(main)).toBe(72);
  });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("rejecting from the home screen updates the dealer, and the account menu signs out", async ({ page }) => {
    await signIn(page, "Super Admin");
    await page.getByRole("button", { name: "Reject", exact: true }).click();
    const confirm = page.getByRole("dialog", { name: "Reject dealer application" });
    await confirm.getByRole("checkbox").check();
    await confirm.getByRole("button", { name: "Reject application" }).click();
    await expect(page.getByRole("status").getByText("Kosi Distribution Co. rejected. Written to audit log.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reject", exact: true })).toBeHidden();

    await page.getByRole("button", { name: "More" }).click();
    await page.getByRole("dialog", { name: "Navigation" }).getByRole("link", { name: /^Dealers\b/ }).click();
    const search = page.getByRole("searchbox", { name: "Search" });
    await expect(search).toBeVisible();
    // The search box (its label) keeps its full height in the phone toolbar.
    expect((await search.locator("xpath=..").boundingBox())?.height).toBeGreaterThan(40);
    await search.fill("Kosi");
    await expect(page.getByRole("listitem").filter({ hasText: "Kosi Distribution Co." }).getByText("Rejected")).toBeVisible();

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test("other roles see access denied", async ({ page }) => {
  await signIn(page, "Dealer");
  await expect(page.getByText("Access denied")).toBeVisible();
});
