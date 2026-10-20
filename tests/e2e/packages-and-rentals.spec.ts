import { expect, test } from "@playwright/test";
import { dollars, readPackagesInOrder } from "./packages";

const packages = readPackagesInOrder();

test.beforeEach(async ({ page }) => {
  await page.goto("/packages-and-rentals/");
});

test("each Package shows its name, price and what's included, in display order", async ({ page }) => {
  const cards = page.getByRole("list", { name: "Packages" }).getByRole("listitem").filter({ has: page.getByRole("heading") });

  await expect(cards).toHaveCount(packages.length);
  for (const [index, pkg] of packages.entries()) {
    const card = cards.nth(index);

    await expect(card.getByRole("heading")).toHaveText(pkg.name);
    await expect(card).toContainText(dollars(pkg.price));
    for (const line of pkg.included) {
      await expect(card.getByRole("listitem").filter({ hasText: line })).toHaveCount(1);
    }
    if (pkg.sample) {
      await expect(card.getByText("Sample", { exact: true })).toBeVisible();
    }
  }
});

test('"Packages from $X" shows the cheapest Package\'s price', async ({ page }) => {
  const cheapest = Math.min(...packages.map((pkg) => pkg.price));

  await expect(page.getByRole("heading", { name: `Packages from ${dollars(cheapest)}` })).toBeVisible();
});

test("a custom quote link leads to Contact", async ({ page }) => {
  await page.getByRole("link", { name: /custom quote/i }).click();

  await expect(page).toHaveURL("/contact/");
});

test("How booking works lists inquiry, quote, then the Down payment, and notes the travel fee", async ({ page }) => {
  const booking = page.getByRole("region", { name: "How booking works" });
  const steps = booking.getByRole("listitem");

  await expect(steps).toHaveCount(3);
  await expect(steps.nth(0)).toContainText(/inquiry/i);
  await expect(steps.nth(1)).toContainText(/quote/i);
  await expect(steps.nth(2)).toContainText(/50% non-refundable Down payment/i);
  await expect(steps.nth(2)).toContainText(/hold your date/i);
  await expect(booking).toContainText(/travel fee applies to events outside the GTA/i);
});

test("How booking works links to Contact", async ({ page }) => {
  await page.getByRole("region", { name: "How booking works" }).getByRole("link", { name: "Send an inquiry" }).click();

  await expect(page).toHaveURL("/contact/");
});
