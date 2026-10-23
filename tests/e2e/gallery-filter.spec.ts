import { expect, test, type Page } from "@playwright/test";
import { eventTypesInGallery, eventTypesWithoutSetups } from "./event-types";
import { readSetups } from "./setups";

const setups = readSetups();
// The filter's options and the URL each one is shared as, written out from the spec rather than read
// from the site's list, so links such as the homepage's "baby showers only" keep working.
const eventTypes = [
  { eventType: "Baby shower", url: "/gallery/?type=baby-shower" },
  { eventType: "Birthday", url: "/gallery/?type=birthday" },
  { eventType: "Other", url: "/gallery/?type=other" },
];

const filter = (page: Page) => page.getByRole("group", { name: "Filter by Event type" });
const filterButton = (page: Page, name: string) => filter(page).getByRole("button", { name, exact: true });
const cards = (page: Page) => page.getByRole("list", { name: "Setups" }).getByRole("listitem");
const setupsOf = (eventType: string) => setups.filter((setup) => setup.eventType === eventType);

async function expectOnlySetupsOf(page: Page, eventType: string) {
  const matching = setupsOf(eventType);
  expect(matching.length, `the sample content has a ${eventType} Setup`).toBeGreaterThan(0);

  await expect(cards(page)).toHaveCount(matching.length);
  for (const setup of matching) {
    await expect(cards(page).filter({ hasText: setup.caption })).toBeVisible();
  }
}

async function expectChosen(page: Page, name: string) {
  await expect(filterButton(page, name)).toHaveAttribute("aria-pressed", "true");
  await expect(filter(page).locator('[aria-pressed="true"]')).toHaveCount(1);
}

test("the pills are All, then the Event types with Setups, the most Setups first, then Other", async ({ page }) => {
  await page.goto("/gallery/");

  await expect(filter(page).getByRole("button")).toHaveText(["All", ...eventTypesInGallery(setups)]);
});

test("a link to an Event type without Setups, or one that doesn't exist, shows every Setup with All chosen", async ({
  page,
}) => {
  const withoutSetups = eventTypesWithoutSetups(setups);
  expect(withoutSetups.length, "the list has an Event type without sample Setups").toBeGreaterThan(0);

  for (const eventType of [...withoutSetups, "no-such-event"]) {
    await page.goto(`/gallery/?type=${eventType.toLowerCase().replaceAll(" ", "-")}`);

    await expect(cards(page)).toHaveCount(setups.length);
    await expectChosen(page, "All");
    await expect(filterButton(page, eventType)).toHaveCount(0);
  }
});

test.describe("on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "the pills only stay on one row on a narrow screen");

  test("the pills stay on one row, and a filtered link shows its pill", async ({ page }) => {
    await page.goto("/gallery/?type=other");
    const tops = await filter(page)
      .getByRole("button")
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top));

    expect(new Set(tops).size, "one row").toBe(1);
    await expect(filterButton(page, "Other")).toBeInViewport({ ratio: 1 });
  });
});

test("each Event type shows only its Setups and is marked as chosen", async ({ page }) => {
  await page.goto("/gallery/");

  for (const { eventType } of eventTypes) {
    await filterButton(page, eventType).click();

    await expectOnlySetupsOf(page, eventType);
    await expectChosen(page, eventType);
  }
});

test("All shows every Setup again", async ({ page }) => {
  await page.goto("/gallery/");
  await filterButton(page, "Birthday").click();

  await filterButton(page, "All").click();

  await expect(cards(page)).toHaveCount(setups.length);
  await expectChosen(page, "All");
});

test("choosing an Event type puts it in the URL", async ({ page }) => {
  await page.goto("/gallery/");

  for (const { eventType, url } of eventTypes) {
    await filterButton(page, eventType).click();

    await expect(page).toHaveURL(url);
  }
});

test("a filtered URL loads already filtered", async ({ page }) => {
  for (const { eventType, url } of eventTypes) {
    await page.goto(url);

    await expectOnlySetupsOf(page, eventType);
    await expectChosen(page, eventType);
  }
});

test("after choosing All, the URL loads every Setup", async ({ page }) => {
  await page.goto("/gallery/?type=other");
  await filterButton(page, "All").click();

  await page.reload();

  await expect(cards(page)).toHaveCount(setups.length);
  await expectChosen(page, "All");
});

test("the filter works from the keyboard and announces how many Setups are shown", async ({ page }) => {
  const showing = (eventType: string) => {
    const count = setupsOf(eventType).length;
    return `Showing ${count} ${count === 1 ? "Setup" : "Setups"}`;
  };
  await page.goto("/gallery/");
  // The filter comes straight after the Get a quote link.
  await page.getByRole("main").getByRole("link", { name: "Get a quote" }).focus();

  await page.keyboard.press("Tab");
  await expect(filterButton(page, "All")).toBeFocused();
  // The buttons go by how many Setups each Event type has, so Birthday's place follows the content.
  const order = (await filter(page).getByRole("button").allTextContents()).map((name) => name.trim());
  for (let step = 0; step < order.indexOf("Birthday"); step++) await page.keyboard.press("Tab");
  await expect(filterButton(page, "Birthday")).toBeFocused();
  await page.keyboard.press("Enter");
  await expectOnlySetupsOf(page, "Birthday");
  await expect(page.getByRole("status")).toHaveText(showing("Birthday"));

  const next = order[order.indexOf("Birthday") + 1];
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await expectOnlySetupsOf(page, next);
  await expect(page.getByRole("status")).toHaveText(showing(next));
});
