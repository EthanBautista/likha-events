import { expect, test, type Locator, type Page } from "@playwright/test";
import { readSetups } from "./setups";

const setups = readSetups();

// With "reduce motion" turned on, nothing moves: the homepage, the menu, every Setup, every filter result,
// the Photo viewer, Packages & Rentals, the Contact form and the thank-you page are fully shown straight
// away, without waiting for an animation.
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
    expect(await page.evaluate(() => document.getAnimations().length), "animations running").toBe(0);
    expect(await viewer(page).isVisible(), "closed without a closing animation").toBe(false);
  });

  test("the Photo viewer moves to the next photo straight away, without gliding", async ({ page }) => {
    const withMorePhotos = setups.find((setup) => setup.photos?.length)!;
    await page.goto("/gallery/");
    await cards(page).filter({ hasText: withMorePhotos.caption }).getByRole("button").click();
    const track = viewer(page).getByRole("list", { name: "Photos" });

    await page.keyboard.press("ArrowRight");

    // Read at once: a glide would still be part way there.
    expect(await track.evaluate((track) => track.scrollLeft / track.clientWidth), "on the second photo").toBe(1);
    await expectShownNow(page, viewer(page).getByRole("img"));
  });
});

test.describe("Packages & Rentals", () => {
  const content = (page: Page) => page.getByRole("main").locator("h2, h3, p, img, a").filter({ visible: true });

  test("every Package, Rental and booking step is shown straight away, including those further down", async ({
    page,
  }) => {
    await page.goto("/packages-and-rentals/");

    await expectShownNow(page, content(page));
    await page.getByRole("heading", { name: "How booking works" }).scrollIntoViewIfNeeded();
    await expectShownNow(page, content(page));
  });
});

test.describe("the Contact form", () => {
  test("a missing field's message is shown straight away", async ({ page }) => {
    await page.goto("/contact/");

    await page.getByRole("button", { name: "Send inquiry" }).click();

    await expectShownNow(page, page.getByText("Please enter your name."));
  });

  test("sending is shown straight away, with nothing turning", async ({ page }) => {
    await page.goto("/contact/");
    // Keep the browser on the form, as it stays while a slow post is still on its way.
    await page.evaluate(() => addEventListener("submit", (event) => event.preventDefault()));
    await page.getByLabel("Your name").fill("Maria Santos");
    await page.getByLabel("Phone number or email").fill("maria@example.com");
    await page.getByLabel("Event date").fill("2027-05-15");
    await page.getByLabel("Venue or city").fill("Markham");
    await page.getByLabel("Event type").selectOption("Baby shower");

    await page.getByRole("button", { name: "Send inquiry" }).click();

    await expectShownNow(page, page.getByRole("button", { name: "Sending your inquiry…" }));
  });
});

test.describe("the thank-you page", () => {
  test("is shown straight away", async ({ page }) => {
    await page.goto("/contact/thanks/");

    await expectShownNow(page, page.getByRole("main").locator("h1, p"));
  });
});
