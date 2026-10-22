import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { homepageCaptions, readSetups } from "../e2e/setups";

// Some behaviour only shows with content the site doesn't ship, such as only one featured Setup.
// These tests build a copy of the whole site with a fixture in place of its content, and open it in a browser.
// A fixture is a folder holding any of a setups/ folder of Setup files, a wedding-packages/ folder of
// Wedding Package files and an event-types.json list, each used in place of the site's own. An empty
// folder, kept in git by a .gitkeep, means the site has none.

const repoRoot = join(import.meta.dirname, "../..");
const workDir = join(import.meta.dirname, ".tmp");
const astroCli = join(repoRoot, "node_modules/astro/bin/astro.mjs");
const fixtureOrigin = "http://fixture-site.test";

const contentTypes: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

test.describe.configure({ timeout: 120_000 });

/** Builds the site with the given fixture's content in place of its own, and returns the built site's folder. */
function buildWithFixture(fixture: string): string {
  const root = join(workDir, fixture);
  const fixtureDir = join(import.meta.dirname, fixture);
  rmSync(root, { recursive: true, force: true });
  for (const path of ["src", "public", "astro.config.mjs", "tsconfig.json"]) {
    cpSync(join(repoRoot, path), join(root, path), { recursive: true });
  }
  for (const folder of ["setups", "wedding-packages"]) {
    if (!existsSync(join(fixtureDir, folder))) continue;
    rmSync(join(root, "src/content", folder), { recursive: true });
    cpSync(join(fixtureDir, folder), join(root, "src/content", folder), { recursive: true });
  }
  if (existsSync(join(fixtureDir, "event-types.json"))) {
    cpSync(join(fixtureDir, "event-types.json"), join(root, "src/content/event-types.json"));
  }

  const result = spawnSync(process.execPath, [astroCli, "build", "--root", root], { cwd: repoRoot, encoding: "utf8" });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  return join(root, "dist");
}

/** Serves the built site at the fixture origin, for this page only. */
async function serve(page: Page, dist: string) {
  await page.route(`${fixtureOrigin}/**`, (route) => {
    let file = join(dist, decodeURIComponent(new URL(route.request().url()).pathname));
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) return route.fulfill({ status: 404 });
    return route.fulfill({ body: readFileSync(file), contentType: contentTypes[extname(file)] });
  });
}

test("with only one featured Setup, the newest unfeatured Setups fill the homepage", async ({ page }) => {
  const fixture = "one-featured-setup";
  await serve(page, buildWithFixture(fixture));

  await page.goto(`${fixtureOrigin}/`);
  const cards = page.getByRole("list", { name: "Featured Setups" }).getByRole("listitem");
  const expected = homepageCaptions(readSetups(join(import.meta.dirname, fixture, "setups")));

  expect(expected).toEqual(["Featured but oldest", "Newest unfeatured", "Second newest unfeatured"]);
  await expect(cards).toHaveCount(3);
  for (const [index, caption] of expected.entries()) {
    await expect(cards.nth(index)).toContainText(caption);
  }
});

test.describe("with no Wedding Packages", () => {
  test.describe.configure({ mode: "serial" });
  let dist: string;

  test.beforeAll(() => {
    dist = buildWithFixture("no-wedding-packages");
  });

  test("the Packages & Rentals page leaves their section out", async ({ page }) => {
    await serve(page, dist);
    await page.goto(`${fixtureOrigin}/packages-and-rentals/`);

    await expect(page.getByRole("heading", { name: /^Packages from/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Rentals" })).toBeVisible();
    await expect(page.getByRole("region", { name: /Wedding Packages/ })).toHaveCount(0);
    await expect(page.getByText(/Wedding Package/)).toHaveCount(0);
  });

  test("the homepage leaves the Wedding Packages line out", async ({ page }) => {
    await serve(page, dist);
    await page.goto(`${fixtureOrigin}/`);

    await expect(page.getByRole("region", { name: /^Packages from/ })).toBeVisible();
    await expect(page.getByText(/Wedding Package/)).toHaveCount(0);
  });
});

// The list holds Wedding, Birthday and " wedding ", and one Setup is for "Corporate", which isn't on it.
test.describe("after the owner edits the Event types list", () => {
  test.describe.configure({ mode: "serial" });
  let dist: string;

  test.beforeAll(() => {
    dist = buildWithFixture("owner-edited-event-types");
  });

  test("a Setup whose Event type isn't on the list shows under Other", async ({ page }) => {
    await serve(page, dist);
    await page.goto(`${fixtureOrigin}/gallery/`);
    const filter = page.getByRole("group", { name: "Filter by Event type" });
    const cards = page.getByRole("list", { name: "Setups" }).getByRole("listitem");

    await expect(filter.getByRole("button")).toHaveText(["All", "Birthday", "Wedding", "Other"]);
    await filter.getByRole("button", { name: "Other", exact: true }).click();

    await expect(page).toHaveURL(`${fixtureOrigin}/gallery/?type=other`);
    await expect(cards.filter({ visible: true })).toHaveText([/Corporate launch/]);
  });

  test("a name on the list twice, in different capitals and spacing, is one contact form option", async ({ page }) => {
    await serve(page, dist);
    await page.goto(`${fixtureOrigin}/contact/`);

    await expect(page.getByLabel("Event type").locator("option:not([value=''])")).toHaveText(["Birthday", "Wedding", "Other"]);
  });
});

// Ten Event types on the list. Birthday has 3 Setups, Baby shower and Wedding 2 each, and Anniversary,
// Bridal shower, Gender reveal and Graduation 1 each. Christening, Corporate and Proposal have none. Four
// Setups are under Other: two stored as Other and two as "Retirement", which isn't on the list.
test.describe("with many Event types, some without Setups", () => {
  test.describe.configure({ mode: "serial" });
  let dist: string;
  const filter = (page: Page) => page.getByRole("group", { name: "Filter by Event type" });
  const pills = (page: Page) => filter(page).getByRole("button");

  test.beforeAll(() => {
    dist = buildWithFixture("many-event-types");
  });

  test("only Event types with Setups get a pill: All first, the most Setups first, then Other", async ({ page }) => {
    await serve(page, dist);
    await page.goto(`${fixtureOrigin}/gallery/`);

    await expect(pills(page)).toHaveText([
      "All",
      "Birthday",
      "Baby shower",
      "Wedding",
      "Anniversary",
      "Bridal shower",
      "Gender reveal",
      "Graduation",
      "Other",
    ]);
  });

  test("a link to an Event type without Setups shows every Setup, with All chosen", async ({ page }) => {
    await serve(page, dist);
    await page.goto(`${fixtureOrigin}/gallery/?type=proposal`);

    await expect(page.getByRole("list", { name: "Setups" }).getByRole("listitem").filter({ visible: true })).toHaveCount(15);
    await expect(filter(page).getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("the contact form still lists every Event type", async ({ page }) => {
    await serve(page, dist);
    await page.goto(`${fixtureOrigin}/contact/`);

    await expect(page.getByLabel("Event type").locator("option:not([value=''])")).toHaveText([
      "Anniversary",
      "Baby shower",
      "Birthday",
      "Bridal shower",
      "Christening",
      "Corporate",
      "Gender reveal",
      "Graduation",
      "Proposal",
      "Wedding",
      "Other",
    ]);
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("the pills are one row that scrolls sideways, cut off at the screen's edge, with no scrollbar", async ({
      page,
    }) => {
      await serve(page, dist);
      await page.goto(`${fixtureOrigin}/gallery/`);
      const boxes = await pills(page).evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect()));
      const row = filter(page);
      const screen = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        overflow: document.documentElement.scrollWidth - innerWidth,
      }));

      expect(new Set(boxes.map((box) => box.top)).size, "one row").toBe(1);
      expect(await row.evaluate((row) => row.scrollWidth > row.clientWidth), "scrolls sideways").toBe(true);
      expect(
        boxes.some((box) => box.left < screen.width && box.right > screen.width),
        "a pill is cut off at the screen's edge",
      ).toBe(true);
      expect(await row.evaluate((row: HTMLElement) => row.offsetHeight - row.clientHeight), "no scrollbar").toBe(0);
      expect(screen.overflow, "the page itself doesn't scroll sideways").toBeLessThanOrEqual(0);
    });

    test("scrolling the row settles with a pill lined up at its start", async ({ page }) => {
      await serve(page, dist);
      await page.goto(`${fixtureOrigin}/gallery/`);
      const start = await pills(page).first().evaluate((all) => all.getBoundingClientRect().left);

      await filter(page).evaluate((row) => (row.scrollLeft = 30));

      await expect
        .poll(() =>
          pills(page).evaluateAll((buttons, start) =>
            buttons.some((button) => Math.abs(button.getBoundingClientRect().left - start) < 1),
            start,
          ),
        )
        .toBe(true);
    });

    test("a filtered link scrolls its pill into view", async ({ page }) => {
      await serve(page, dist);
      await page.goto(`${fixtureOrigin}/gallery/?type=other`);
      const other = filter(page).getByRole("button", { name: "Other", exact: true });

      await expect(other).toHaveAttribute("aria-pressed", "true");
      const box = (await other.boundingBox())!;
      expect(box.x, "starts on screen").toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, "ends on screen").toBeLessThanOrEqual(
        await page.evaluate(() => document.documentElement.clientWidth),
      );
    });
  });

  test.describe("on a wide screen", () => {
    test.use({ viewport: { width: 1024, height: 800 } });

    test("the pills wrap onto more rows, all of them in view", async ({ page }) => {
      await serve(page, dist);
      await page.goto(`${fixtureOrigin}/gallery/`);
      const tops = await pills(page).evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top));

      expect(new Set(tops).size, "more than one row").toBeGreaterThan(1);
      expect(await filter(page).evaluate((row) => row.scrollWidth > row.clientWidth), "doesn't scroll").toBe(false);
    });
  });
});
