import { expect, test } from "@playwright/test";
import { captionsNewestFirst, readSetups } from "./setups";

const setups = readSetups();

test.beforeEach(async ({ page }) => {
  await page.goto("/gallery/");
});

test("the grid shows every Setup, newest first", async ({ page }) => {
  const cards = page.getByRole("list", { name: "Setups" }).getByRole("listitem");

  await expect(cards).toHaveCount(setups.length);
  for (const [index, caption] of captionsNewestFirst(setups).entries()) {
    await expect(cards.nth(index)).toContainText(caption);
  }
});

test("a Get a quote link near the gallery leads to Contact", async ({ page }) => {
  await page.getByRole("main").getByRole("link", { name: "Get a quote" }).click();

  await expect(page).toHaveURL("/contact/");
});

test("each card shows its caption and cover photo", async ({ page }) => {
  const grid = page.getByRole("list", { name: "Setups" });

  for (const setup of setups) {
    const card = grid.getByRole("listitem").filter({ hasText: setup.caption });
    const cover = card.getByRole("img", { name: setup.caption });

    await expect(card).toHaveCount(1);
    await cover.scrollIntoViewIfNeeded();
    await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    if (setup.sample) {
      await expect(card.getByText("Sample", { exact: true })).toBeVisible();
    }
  }
});
