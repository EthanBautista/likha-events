import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { captionsNewestFirst, readSetups, type SetupFile } from "./setups";

const setups = readSetups();
// The cover plus the photos after it.
const photoCount = (setup: SetupFile) => 1 + (setup.photos?.length ?? 0);
// The Setup with the most photos, so the viewer is checked showing more than the cover.
const setup = setups.toSorted((a, b) => photoCount(b) - photoCount(a))[0];

const card = (page: Page, setup: SetupFile) =>
  page.getByRole("list", { name: "Setups" }).getByRole("listitem").filter({ hasText: setup.caption });
const viewer = (page: Page) => page.getByRole("dialog");

async function open(page: Page, setup: SetupFile) {
  await card(page, setup).getByRole("button").click();
  await expect(viewer(page)).toBeVisible();
}

test("opening a Setup shows its caption and every photo", async ({ page }) => {
  await page.goto("/gallery/");

  await open(page, setup);

  await expect(viewer(page)).toHaveAccessibleName(setup.caption);
  await expect(viewer(page).getByRole("img")).toHaveCount(photoCount(setup));
});

const closeWays: { way: string; close: (page: Page) => Promise<unknown> }[] = [
  { way: "the Close button", close: (page) => viewer(page).getByRole("button", { name: "Close" }).click() },
  { way: "Escape", close: (page) => page.keyboard.press("Escape") },
  { way: "the back gesture", close: (page) => page.goBack() },
];

for (const { way, close } of closeWays) {
  test(`${way} closes the viewer and stays on the Gallery`, async ({ page }) => {
    await page.goto("/gallery/");
    await open(page, setup);

    await close(page);

    await expect(viewer(page)).toBeHidden();
    await expect(page).toHaveURL("/gallery/");
    await expect(card(page, setup).getByRole("button")).toBeFocused();
  });
}

for (const { way, close } of closeWays.filter(({ way }) => way !== "the back gesture")) {
  test(`closing with ${way} leaves no extra history entry, so back then leaves the Gallery`, async ({ page }) => {
    await page.goto("/");
    await page.goto("/gallery/");
    await open(page, setup);
    await close(page);
    await expect(viewer(page)).toBeHidden();

    await page.goBack();

    await expect(page).toHaveURL("/");
  });
}

test("forward after closing with back opens the Setup again, and back closes it again", async ({ page }) => {
  await page.goto("/");
  await page.goto("/gallery/");
  await open(page, setup);
  await page.goBack();
  await expect(viewer(page)).toBeHidden();

  await page.goForward();
  await expect(viewer(page)).toHaveAccessibleName(setup.caption);

  await page.goBack();
  await expect(viewer(page)).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL("/");
});

test("reloading with a Setup open keeps it open, and back still closes it", async ({ page }) => {
  await page.goto("/");
  await page.goto("/gallery/");
  await open(page, setup);

  await page.reload();
  await expect(viewer(page)).toHaveAccessibleName(setup.caption);

  await page.goBack();
  await expect(viewer(page)).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL("/");
});

test("opening another Setup straight after closing one keeps it open, and back closes it", async ({ page }) => {
  const another = setups.find((each) => each !== setup)!;
  // A slow phone, which takes a moment to go back.
  await page.addInitScript(() => {
    const back = history.back.bind(history);
    history.back = () => setTimeout(back, 500);
  });
  await page.goto("/");
  await page.goto("/gallery/");
  await open(page, setup);

  // A quick second tap, before the phone has finished going back from the first close.
  await viewer(page).getByRole("button", { name: "Close" }).click();
  await card(page, another).getByRole("button").click();

  await expect(viewer(page)).toHaveAccessibleName(another.caption);
  await page.waitForTimeout(1_000);
  await expect(viewer(page)).toHaveAccessibleName(another.caption);
  await page.goBack();
  await expect(viewer(page)).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL("/");
});

test("focus moves into the viewer and every photo has a description", async ({ page }) => {
  await page.goto("/gallery/");

  await open(page, setup);

  await expect(viewer(page).getByRole("button", { name: "Close" })).toBeFocused();
  const namesCaption = new RegExp(setup.caption.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  for (const photo of await viewer(page).getByRole("img").all()) {
    await expect(photo).toHaveAccessibleName(namesCaption);
  }
});

test("the Event type filter is kept after opening and closing a Setup", async ({ page }) => {
  const birthdays = setups.filter((each) => each.eventType === "Birthday");
  await page.goto("/gallery/?type=birthday");
  await open(page, birthdays[0]);

  await page.goBack();

  await expect(viewer(page)).toBeHidden();
  await expect(page).toHaveURL("/gallery/?type=birthday");
  await expect(page.getByRole("button", { name: "Birthday", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("list", { name: "Setups" }).getByRole("listitem")).toHaveCount(birthdays.length);
});

test("the gallery stays scrolled where it was after closing", async ({ page }) => {
  const last = setups.find((each) => each.caption === captionsNewestFirst(setups).at(-1))!;
  await page.goto("/gallery/");
  await card(page, last).scrollIntoViewIfNeeded();
  const scrolled = await page.evaluate(() => scrollY);
  expect(scrolled, "the last Setup is below the fold").toBeGreaterThan(0);

  for (const { close } of closeWays) {
    await open(page, last);
    await close(page);
    await expect(viewer(page)).toBeHidden();

    expect(await page.evaluate(() => scrollY)).toBe(scrolled);
  }
});

test("the open viewer meets WCAG AA", async ({ page }) => {
  await page.goto("/gallery/");
  await open(page, setup);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  expect(results.violations).toEqual([]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a Setup's photos still open and close", async ({ page }) => {
    await page.goto("/gallery/");

    await open(page, setup);
    await expect(viewer(page).getByRole("img")).toHaveCount(photoCount(setup));

    await viewer(page).getByRole("button", { name: "Close" }).click();
    await expect(viewer(page)).toBeHidden();
  });
});
