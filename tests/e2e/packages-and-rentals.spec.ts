import { expect, test } from "@playwright/test";
import { dollars, readPackagesInOrder } from "./packages";
import { readRentalsInOrder } from "./rentals";

const packages = readPackagesInOrder();
const rentals = readRentalsInOrder();

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

test("each Rental shows its name, photo, price per event and description, in display order", async ({ page }) => {
  const cards = page.getByRole("list", { name: "Rentals" }).getByRole("listitem");

  await expect(cards).toHaveCount(rentals.length);
  for (const [index, rental] of rentals.entries()) {
    const card = cards.nth(index);

    await expect(card.getByRole("heading")).toHaveText(rental.name);
    await expect(card.getByRole("img", { name: rental.name })).toHaveAttribute("src", rental.photo);
    await expect(card).toContainText(`${dollars(rental.price)} per event`);
    await expect(card).toContainText(rental.description);
    if (rental.sample) {
      await expect(card.getByText("Sample", { exact: true })).toBeVisible();
    }
  }
});

test("Rentals have their own section, after the Packages and holding none of them", async ({ page }) => {
  const rentalsSection = page.getByRole("region", { name: "Rentals" });
  const packagesList = page.getByRole("list", { name: "Packages" });

  await expect(rentalsSection).toBeVisible();
  await expect(rentalsSection.getByRole("list", { name: "Packages" })).toHaveCount(0);
  await expect(packagesList.getByRole("list", { name: "Rentals" })).toHaveCount(0);
  for (const pkg of packages) {
    await expect(rentalsSection.getByRole("heading", { name: pkg.name })).toHaveCount(0);
  }
  const packagesComeFirst = await packagesList.evaluate(
    (list, section) => !!(list.compareDocumentPosition(section!) & Node.DOCUMENT_POSITION_FOLLOWING),
    await rentalsSection.elementHandle(),
  );
  expect(packagesComeFirst).toBe(true);
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
