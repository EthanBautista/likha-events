import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { captionsNewestFirst, readSetups, type SetupFile } from "./setups";

const setups = readSetups();
// The cover plus the photos after it.
const photoCount = (setup: SetupFile) => 1 + (setup.photos?.length ?? 0);
// The Setup with the most photos, so the viewer is checked showing more than the cover.
const setup = setups.toSorted((a, b) => photoCount(b) - photoCount(a))[0];

const card = (page: Page, setup: SetupFile) =>
  page.getByRole("list", { name: "Setups" }).getByRole("listitem").filter({ hasText: setup.caption });
const viewer = (page: Page) => page.getByRole("dialog");

/**
 * Waits for the viewer to finish closing, its photo back in the card, as a visitor sees it settle before moving
 * on. While the photo is still shrinking, the page doesn't take taps, and back already leaves the viewer's entry.
 */
const closed = async (page: Page) => {
  await expect(viewer(page)).toBeHidden();
  await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished)));
};

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

// The Photo viewer shows one photo at a time, with a "3 / 9" counter saying which.
const photo = (page: Page, number: number) =>
  viewer(page).getByRole("img", { name: `${setup.caption}, photo ${number} of ${photoCount(setup)}` });
const counter = (page: Page) => viewer(page).getByText(/^\d+ \/ \d+$/);

async function expectShowing(page: Page, number: number) {
  await expect(counter(page)).toHaveText(`${number} / ${photoCount(setup)}`);
  await expect(photo(page, number)).toBeInViewport({ ratio: 0.9 });
  for (const other of [number - 1, number + 1].filter((each) => each >= 1 && each <= photoCount(setup))) {
    await expect(photo(page, other)).not.toBeInViewport();
  }
}

test("a Setup opens on its cover photo, counted as the first", async ({ page }) => {
  await page.goto("/gallery/");

  await open(page, setup);

  await expectShowing(page, 1);
});

test("moving to another photo is announced politely", async ({ page }) => {
  await page.goto("/gallery/");
  await open(page, setup);

  await page.keyboard.press("ArrowRight");

  await expect(viewer(page).getByRole("status")).toContainText(`Photo 2 of ${photoCount(setup)}`);
});

test.describe("on desktop", () => {
  test.skip(({ isMobile }) => isMobile, "the buttons and thumbnails are for a wide screen and a mouse");

  const previous = (page: Page) => viewer(page).getByRole("button", { name: "Previous photo" });
  const next = (page: Page) => viewer(page).getByRole("button", { name: "Next photo" });

  test("Next and Previous move one photo at a time, and stop at each end", async ({ page }) => {
    await page.goto("/gallery/");
    await open(page, setup);
    await expect(previous(page)).toBeDisabled();

    await next(page).click();
    await expectShowing(page, 2);
    await next(page).click();
    await expectShowing(page, 3);
    await previous(page).click();
    await expectShowing(page, 2);

    for (let number = 3; number <= photoCount(setup); number++) await next(page).click();
    await expectShowing(page, photoCount(setup));
    await expect(next(page)).toBeDisabled();
    await expect(previous(page)).toBeEnabled();
  });

  test("the arrow keys move one photo at a time, and stop at each end", async ({ page }) => {
    await page.goto("/gallery/");
    await open(page, setup);

    await page.keyboard.press("ArrowLeft");
    await expectShowing(page, 1);
    await page.keyboard.press("ArrowRight");
    await expectShowing(page, 2);
    await page.keyboard.press("ArrowRight");
    await expectShowing(page, 3);
    await page.keyboard.press("ArrowLeft");
    await expectShowing(page, 2);

    for (let number = 3; number <= photoCount(setup) + 1; number++) await page.keyboard.press("ArrowRight");
    await expectShowing(page, photoCount(setup));
  });

  test("a thumbnail jumps straight to its photo, and the current photo's thumbnail is marked", async ({ page }) => {
    const thumbnail = (number: number) =>
      viewer(page).getByRole("group", { name: "Jump to a photo" }).getByRole("button", { name: `Photo ${number}`, exact: true });
    const last = photoCount(setup);
    await page.goto("/gallery/");
    await open(page, setup);
    await expect(thumbnail(1)).toHaveAttribute("aria-current", "true");

    await thumbnail(last).click();

    await expectShowing(page, last);
    await expect(thumbnail(last)).toHaveAttribute("aria-current", "true");
    await expect(thumbnail(1)).not.toHaveAttribute("aria-current", "true");

    await thumbnail(2).click();
    await expectShowing(page, 2);
    await expect(thumbnail(2)).toHaveAttribute("aria-current", "true");
  });
});

test.describe("on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "the photo has the whole of a phone's screen");

  // A swipe is the browser's own scrolling of the track, settling on the next photo.
  const swipe = (page: Page, photos: number) =>
    viewer(page)
      .getByRole("list", { name: "Photos" })
      .evaluate((track, photos) => track.scrollBy({ left: photos * track.clientWidth }), photos);

  test("only the counter is shown, with no thumbnails or arrows", async ({ page }) => {
    await page.goto("/gallery/");

    await open(page, setup);

    await expect(counter(page)).toBeVisible();
    await expect(viewer(page).getByRole("button", { name: /Previous|Next/ })).toHaveCount(0);
    await expect(viewer(page).getByRole("group", { name: "Jump to a photo" })).toBeHidden();
  });

  test("swiping moves to the next or previous photo, and the counter follows", async ({ page }) => {
    await page.goto("/gallery/");
    await open(page, setup);

    await swipe(page, 1);
    await expectShowing(page, 2);
    await swipe(page, 1);
    await expectShowing(page, 3);
    await swipe(page, -1);
    await expectShowing(page, 2);
  });
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
    await closed(page);

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
  // Let the card finish rising into view, or clicking it mid-way scrolls the page a little further.
  await card(page, last).evaluate((li) => Promise.all(li.getAnimations({ subtree: true }).map((each) => each.finished)));
  const scrolled = await page.evaluate(() => scrollY);
  expect(scrolled, "the last Setup is below the fold").toBeGreaterThan(0);

  for (const { close } of closeWays) {
    await open(page, last);
    await close(page);
    await closed(page);

    expect(await page.evaluate(() => scrollY)).toBe(scrolled);
  }
});

test("the open viewer meets WCAG AA", async ({ page }) => {
  await page.goto("/gallery/");
  await open(page, setup);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  expect(results.violations).toEqual([]);
});

// The tapped card's photo grows into the viewer, and shrinks back into the card on close. Each View
// Transition is recorded once under way: for each part of the moving photo (not the page cross-fading
// behind it), where its centre is on screen as it starts and as it ends, and which properties it animates.
interface Point {
  x: number;
  y: number;
}

interface PhotoPart {
  part: string;
  from: Point;
  to: Point;
  animates: string[];
}

async function recordPhotoMoves(page: Page) {
  await page.addInitScript(() => {
    const moves: PhotoPart[][] = [];
    Object.assign(window, { photoMoves: moves });
    const start = Document.prototype.startViewTransition;
    if (!start) return;

    const matrix = (transform: unknown) => new DOMMatrix(transform && transform !== "none" ? String(transform) : undefined);
    const centreAt = (effect: KeyframeEffect, keyframe: Keyframe) => {
      const name = /\((.+)\)/.exec(effect.pseudoElement!)![1];
      const corner = matrix(getComputedStyle(document.documentElement, `::view-transition-group(${name})`).transform);
      const style = getComputedStyle(document.documentElement, effect.pseudoElement!);
      const [originX, originY] = style.transformOrigin.split(" ").map(parseFloat);
      const moved = matrix(keyframe.transform).transformPoint({
        x: parseFloat(style.width) / 2 - originX,
        y: parseFloat(style.height) / 2 - originY,
      });
      return { x: corner.e + originX + moved.x, y: corner.f + originY + moved.y };
    };

    Document.prototype.startViewTransition = function (this: Document, ...args: Parameters<typeof start>) {
      const transition = start.apply(this, args);
      transition.ready
        .then(() => new Promise((settled) => setTimeout(settled)))
        .then(() =>
          moves.push(
            document
              .getAnimations()
              .map((animation) => animation.effect as KeyframeEffect)
              .filter((effect) => effect.pseudoElement?.startsWith("::view-transition") && !effect.pseudoElement.includes("(root)"))
              .map((effect) => {
                const keyframes = effect.getKeyframes();
                const animates = [...new Set(keyframes.flatMap((keyframe) => Object.keys(keyframe)))].filter(
                  (key) => !["offset", "computedOffset", "easing", "composite"].includes(key),
                );
                return {
                  part: effect.pseudoElement!,
                  from: centreAt(effect, keyframes[0]),
                  to: centreAt(effect, keyframes.at(-1)!),
                  animates,
                };
              }),
          ),
        )
        .catch(() => {});
      return transition;
    };
  });
}

const photoMoves = (page: Page) => page.evaluate(() => (window as unknown as { photoMoves: PhotoPart[][] }).photoMoves);

/** The part arriving in a transition: the viewer's photo on opening, the card's photo on closing. */
const arriving = (move: PhotoPart[]) => move.find(({ part }) => part.startsWith("::view-transition-new"))!;

const centreOf = async (element: Locator): Promise<Point> => {
  const box = (await element.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

function expectAt(point: Point, expected: Point, where: string) {
  expect(Math.abs(point.x - expected.x), `${where}, across`).toBeLessThan(2);
  expect(Math.abs(point.y - expected.y), `${where}, down`).toBeLessThan(2);
}

/** Where the card's photo is once on screen and settled, as the visitor sees it before tapping. */
async function cardPhotoAt(page: Page, setup: SetupFile) {
  await card(page, setup).scrollIntoViewIfNeeded();
  await card(page, setup).evaluate((li) => Promise.all(li.getAnimations({ subtree: true }).map((each) => each.finished)));
  return centreOf(card(page, setup).getByRole("img"));
}

test.describe("the card's photo and the viewer", () => {
  test.beforeEach(async ({ page }) => recordPhotoMoves(page));

  test("opening grows the tapped card's photo into the viewer's cover photo", async ({ page }) => {
    await page.goto("/gallery/");
    const cardAt = await cardPhotoAt(page, setup);

    await open(page, setup);

    await expect.poll(async () => (await photoMoves(page)).length).toBe(1);
    const [opening] = await photoMoves(page);
    expectAt(arriving(opening).from, cardAt, "starts on the card's photo");
    expectAt(arriving(opening).to, await centreOf(photo(page, 1)), "ends on the viewer's photo");
    await expectShowing(page, 1);
  });

  for (const { way, close } of closeWays) {
    test(`closing with ${way} shrinks the cover photo back into its card`, async ({ page }) => {
      await page.goto("/gallery/");
      const cardAt = await cardPhotoAt(page, setup);
      await open(page, setup);
      await expect.poll(async () => (await photoMoves(page)).length).toBe(1);
      await expectShowing(page, 1);
      const viewerAt = await centreOf(photo(page, 1));

      await close(page);

      await expect.poll(async () => (await photoMoves(page)).length).toBe(2);
      const closing = (await photoMoves(page))[1];
      expectAt(arriving(closing).from, viewerAt, "starts on the viewer's photo");
      expectAt(arriving(closing).to, cardAt, "ends on the card's photo");
      await expect(viewer(page)).toBeHidden();
      await expect(card(page, setup).getByRole("button")).toBeFocused();
    });
  }

  test("the photo moves with transform and opacity only, both ways", async ({ page }) => {
    await page.goto("/gallery/");
    await open(page, setup);
    await viewer(page).getByRole("button", { name: "Close" }).click();
    await closed(page);

    const moves = await photoMoves(page);
    expect(moves).toHaveLength(2);
    for (const { part, animates } of moves.flat()) {
      expect(animates.length, `${part} moves`).toBeGreaterThan(0);
      for (const property of animates) expect(["transform", "opacity"], `${part} animates ${property}`).toContain(property);
    }
  });

  test("closing after moving to another photo fades the viewer, with no photo moving", async ({ page }) => {
    await page.goto("/gallery/");
    await open(page, setup);
    await expect.poll(async () => (await photoMoves(page)).length).toBe(1);
    await page.keyboard.press("ArrowRight");
    await expectShowing(page, 2);

    await viewer(page).getByRole("button", { name: "Close" }).click();
    await closed(page);

    expect(await photoMoves(page), "only the opening moved the photo").toHaveLength(1);
    await expect(card(page, setup).getByRole("button")).toBeFocused();
  });

  test("from a filtered gallery, the photo grows from its card and returns to it", async ({ page }) => {
    const birthday = setups.find((each) => each.eventType === "Birthday")!;
    await page.goto("/gallery/?type=birthday");
    const cardAt = await cardPhotoAt(page, birthday);

    await open(page, birthday);
    await expect.poll(async () => (await photoMoves(page)).length).toBe(1);
    await viewer(page).getByRole("button", { name: "Close" }).click();
    await closed(page);

    const [opening, closing] = await photoMoves(page);
    expectAt(arriving(opening).from, cardAt, "grows from the card's photo");
    expectAt(arriving(closing).to, cardAt, "shrinks back into the card's photo");
    await expect(page).toHaveURL("/gallery/?type=birthday");
  });

  test("a Setup tapped while the filter is still easing between results opens, grows and closes as usual", async ({ page }) => {
    const birthdays = setups.filter((each) => each.eventType === "Birthday");
    await page.goto("/gallery/");

    await page.getByRole("button", { name: "Birthday", exact: true }).click();
    await open(page, birthdays[0]);

    await expect(viewer(page)).toHaveAccessibleName(birthdays[0].caption);
    await expect.poll(async () => (await photoMoves(page)).length).toBe(1);
    await viewer(page).getByRole("button", { name: "Close" }).click();
    await closed(page);
    await expect.poll(async () => (await photoMoves(page)).length).toBe(2);
    await expect(card(page, birthdays[0]).getByRole("button")).toBeFocused();
    await expect(page.getByRole("list", { name: "Setups" }).getByRole("listitem")).toHaveCount(birthdays.length);
  });
});

test.describe("in a browser without View Transitions", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => delete (Document.prototype as Partial<Document>).startViewTransition);
  });

  test("the viewer opens on its cover and closes back to its card", async ({ page }) => {
    await page.goto("/gallery/");

    await open(page, setup);
    await expectShowing(page, 1);
    await viewer(page).getByRole("button", { name: "Close" }).click();

    await expect(viewer(page)).toBeHidden();
    await expect(page).toHaveURL("/gallery/");
    await expect(card(page, setup).getByRole("button")).toBeFocused();
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a Setup's photos still open, scroll one at a time and close", async ({ page }) => {
    await page.goto("/gallery/");

    await open(page, setup);
    await expect(viewer(page).getByRole("img")).toHaveCount(photoCount(setup));
    await expect(photo(page, 1)).toBeInViewport({ ratio: 0.9 });
    await viewer(page)
      .getByRole("list", { name: "Photos" })
      .evaluate((track) => track.scrollBy({ left: track.clientWidth }));
    await expect(photo(page, 2)).toBeInViewport({ ratio: 0.9 });

    await viewer(page).getByRole("button", { name: "Close" }).click();
    await expect(viewer(page)).toBeHidden();
  });
});
