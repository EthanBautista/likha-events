import { expect, test, type Locator } from "@playwright/test";
import { dollars, readPackagesInOrder, readWeddingPackagesInOrder, type PackageFile } from "./packages";
import { readRentalsInOrder } from "./rentals";

const packages = readPackagesInOrder();
const weddingPackages = readWeddingPackagesInOrder();
const rentals = readRentalsInOrder();

/** Checks the list's cards show each Package's name, price and what's included, in display order. */
async function expectPackageCards(list: Locator, expected: PackageFile[]) {
  const cards = list.getByRole("listitem").filter({ has: list.page().getByRole("heading") });

  await expect(cards).toHaveCount(expected.length);
  for (const [index, pkg] of expected.entries()) {
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
}

test.beforeEach(async ({ page }) => {
  await page.goto("/packages-and-rentals/");
});

test("each Package shows its name, price and what's included, in display order", async ({ page }) => {
  await expectPackageCards(page.getByRole("list", { name: "Packages", exact: true }), packages);
});

test("each Wedding Package shows its name, price and what's included, in display order", async ({ page }) => {
  expect(weddingPackages.length, "sample Wedding Packages").toBeGreaterThan(0);
  await expectPackageCards(page.getByRole("list", { name: "Wedding Packages", exact: true }), weddingPackages);
});

test("each Rental shows its name, photo, price per event and description, in display order", async ({ page }) => {
  const cards = page.getByRole("list", { name: "Rentals" }).getByRole("listitem");

  await expect(cards).toHaveCount(rentals.length);
  for (const [index, rental] of rentals.entries()) {
    const card = cards.nth(index);

    await expect(card.getByRole("heading")).toHaveText(rental.name);
    const photo = card.getByRole("img", { name: rental.name });
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(card).toContainText(`${dollars(rental.price)} per event`);
    await expect(card).toContainText(rental.description);
    if (rental.sample) {
      await expect(card.getByText("Sample", { exact: true })).toBeVisible();
    }
  }
});

/** Whether the first element comes before the second on the page. */
async function comesBefore(first: Locator, second: Locator): Promise<boolean> {
  return first.evaluate(
    (element, other) => !!(element.compareDocumentPosition(other!) & Node.DOCUMENT_POSITION_FOLLOWING),
    await second.elementHandle(),
  );
}

test("Rentals have their own section, after the Packages and holding none of them", async ({ page }) => {
  const rentalsSection = page.getByRole("region", { name: "Rentals" });
  const packagesList = page.getByRole("list", { name: "Packages", exact: true });

  await expect(rentalsSection).toBeVisible();
  await expect(rentalsSection.getByRole("list", { name: /Packages/ })).toHaveCount(0);
  await expect(packagesList.getByRole("list", { name: "Rentals" })).toHaveCount(0);
  for (const pkg of packages) {
    await expect(rentalsSection.getByRole("heading", { name: pkg.name })).toHaveCount(0);
  }
  expect(await comesBefore(packagesList, rentalsSection)).toBe(true);
});

test("Wedding Packages have their own section, between the Packages and the Rentals", async ({ page }) => {
  const weddingSection = page.getByRole("region", { name: /^Wedding Packages/ });
  const packagesList = page.getByRole("list", { name: "Packages", exact: true });
  const rentalsSection = page.getByRole("region", { name: "Rentals" });

  await expect(weddingSection.getByRole("list", { name: "Wedding Packages", exact: true })).toBeVisible();
  await expect(weddingSection.getByRole("list", { name: "Packages", exact: true })).toHaveCount(0);
  for (const pkg of packages) {
    await expect(weddingSection.getByRole("heading", { name: pkg.name, exact: true })).toHaveCount(0);
  }
  expect(await comesBefore(packagesList, weddingSection), "after the Packages").toBe(true);
  expect(await comesBefore(weddingSection, rentalsSection), "before the Rentals").toBe(true);
});

test('"Packages from $X" shows the cheapest Package\'s price, leaving out Wedding Packages', async ({ page }) => {
  const cheapest = Math.min(...packages.map((pkg) => pkg.price));

  await expect(page.getByRole("heading", { name: `Packages from ${dollars(cheapest)}`, exact: true })).toBeVisible();
});

test('"Wedding Packages from $Y" shows the cheapest Wedding Package\'s price', async ({ page }) => {
  const cheapest = Math.min(...weddingPackages.map((pkg) => pkg.price));

  await expect(page.getByRole("heading", { name: `Wedding Packages from ${dollars(cheapest)}`, exact: true })).toBeVisible();
});

test("the Wedding Packages section links to Contact with Wedding chosen", async ({ page }) => {
  await page.getByRole("region", { name: /^Wedding Packages/ }).getByRole("link", { name: "Ask about a Wedding Package" }).click();

  await expect(page).toHaveURL("/contact/?type=wedding");
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
