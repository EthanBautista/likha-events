import { expect, test, type Locator, type Page } from "@playwright/test";
import { readSetups } from "./setups";

const setups = readSetups();

// With "reduce motion" turned on, nothing moves: the homepage, the menu, every Setup, every filter result
// and the Photo viewer are fully shown straight away, without waiting for an animation.
test.use({ reducedMotion: "reduce" });

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

test.describe("the homepage", () => {
  // Everything the visitor reads or uses, from the hero down to the closing call to action.
  const content = (page: Page) =>
    page.getByRole("main").locator("h2, p, img, a, svg").filter({ visible: true });

  test("is shown straight away, including the sections further down", async ({ page }) => {
    await page.goto("/");

    await expectShownNow(page, content(page));
    await page.getByRole("heading", { name: "Planning an event?" }).scrollIntoViewIfNeeded();
    await expectShownNow(page, content(page));
  });
});

test.describe("the phone menu", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu only collapses below tablet width");

  test("opens and closes straight away", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu" });
    const links = page.getByRole("navigation", { name: "Main" }).getByRole("link");

    await menuButton.click();
    await expectShownNow(page, links);

    await menuButton.click();
    expect(await page.evaluate(() => document.getAnimations().length), "animations running").toBe(0);
    expect(await links.first().isVisible(), "closed without a closing animation").toBe(false);
  });
});

test.describe("the Gallery", () => {
  const cards = (page: Page) => page.getByRole("list", { name: "Setups" }).getByRole("listitem");
  const viewer = (page: Page) => page.getByRole("dialog");

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
});
