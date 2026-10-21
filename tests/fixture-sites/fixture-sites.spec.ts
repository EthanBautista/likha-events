import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { homepageCaptions, readSetups } from "../e2e/setups";

// Some behaviour only shows with content the site doesn't ship, such as only one featured Setup.
// These tests build a copy of the whole site with a fixture in place of its content, and open it in a browser.
// A fixture is a folder holding a setups/ folder of Setup files, and optionally an event-types.json list.

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
  rmSync(join(root, "src/content/setups"), { recursive: true });
  cpSync(join(fixtureDir, "setups"), join(root, "src/content/setups"), { recursive: true });
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
