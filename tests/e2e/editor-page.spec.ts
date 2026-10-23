import { expect, test, type Page } from "@playwright/test";

// The owner's editor page. Signing in needs GitHub, so these tests stop at the sign-in screen.

/** The editor wraps "GitHub" in invisible direction marks, hence the \W*. */
const signInButton = (page: Page) => page.getByRole("button", { name: /sign in with \W*github/i });

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/");
  // The editor is a large app, so give it longer than a site page to start.
  await expect(signInButton(page)).toBeVisible({ timeout: 15_000 });
});

test("the editor page offers to sign in with GitHub", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Likha Events editor" })).toBeVisible();
  await expect(signInButton(page)).toBeEnabled();
});

test("the editor page links to the Inquiry dashboard", async ({ page }) => {
  const link = page.getByRole("link", { name: "Inquiries" });

  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/admin/inquiries/");
});

test("the editor page can be added to the home screen as an app", async ({ page, request }) => {
  // The editor adds a manifest of its own after ours, but a browser uses only the first.
  const href = await page.locator('link[rel="manifest"]').first().getAttribute("href");
  const manifest = await (await request.get(href!)).json();

  expect(manifest.start_url).toBe("/admin/");
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons) {
    expect((await request.get(icon.src)).ok()).toBe(true);
  }
  const appleIcon = await page.locator('link[rel="apple-touch-icon"]').first().getAttribute("href");
  expect((await request.get(appleIcon!)).ok()).toBe(true);
});

test("the editor page does not scroll sideways", async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

  expect(overflow).toBeLessThanOrEqual(0);
});
