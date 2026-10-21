import { expect, test, type Locator, type Page } from "@playwright/test";
import { readSetups } from "./setups";

const setups = readSetups();

// With "reduce motion" turned on, nothing on the Gallery moves: every Setup, every filter result and
// the Photo viewer are fully shown straight away, without waiting for an animation.
test.use({ reducedMotion: "reduce" });

const cards = (page: Page) => page.getByRole("list", { name: "Setups" }).getByRole("listitem");
const viewer = (page: Page) => page.getByRole("dialog");

// Read once, with no waiting, so an element that is still fading or sliding in fails.
async function expectShownNow(page: Page, elements: Locator) {
  expect(await page.evaluate(() => document.getAnimations().length), "animations running").toBe(0);
  for (const element of await elements.all()) {
    const shown = await element.evaluate((el) => {
      // Faded or moved by the element itself or anything around it.
      for (let each: Element | null = el; each; each = each.parentElement) {
        const style = getComputedStyle(each);
        if (style.opacity !== "1" || style.translate !== "none" || style.scale !== "none") return false;
        if (style.transform !== "none") return false;
      }
      return true;
    });
    expect(shown, "fully shown, in place").toBe(true);
  }
}

test("every Setup is shown straight away, including those further down", async ({ page }) => {
  await page.goto("/gallery/");

  await expectShownNow(page, cards(page).getByRole("img"));
  await cards(page).last().scrollIntoViewIfNeeded();
  await expectShownNow(page, cards(page).getByRole("img"));
});

test("changing the Event type shows the results straight away", async ({ page }) => {
  await page.goto("/gallery/");

  await page.getByRole("button", { name: "Birthday", exact: true }).click();

  await expect(cards(page)).toHaveCount(setups.filter((setup) => setup.eventType === "Birthday").length);
  await expectShownNow(page, cards(page).getByRole("img"));
});

test("the Photo viewer opens and closes straight away", async ({ page }) => {
  await page.goto("/gallery/");

  await cards(page).first().getByRole("button").click();
  await expectShownNow(page, viewer(page));
  await expectShownNow(page, viewer(page).getByRole("img"));

  await viewer(page).getByRole("button", { name: "Close" }).click();
  expect(await viewer(page).isVisible(), "closed without a closing animation").toBe(false);
});
