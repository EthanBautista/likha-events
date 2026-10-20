import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { expect, test } from "@playwright/test";
import { homepageCaptions, readSetups } from "../e2e/setups";

// Some behaviour only shows with content the site doesn't ship, such as only one featured Setup.
// These tests build a copy of the whole site with a fixture in place of its Setups, and open it in a browser.

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

/** Builds the site with the given folder of Setup files in place of its own, and returns the built site's folder. */
function buildWithSetups(fixture: string): string {
  const root = join(workDir, fixture);
  rmSync(root, { recursive: true, force: true });
  for (const path of ["src", "public", "astro.config.mjs", "tsconfig.json"]) {
    cpSync(join(repoRoot, path), join(root, path), { recursive: true });
  }
  rmSync(join(root, "src/content/setups"), { recursive: true });
  cpSync(join(import.meta.dirname, fixture), join(root, "src/content/setups"), { recursive: true });

  const result = spawnSync(process.execPath, [astroCli, "build", "--root", root], { cwd: repoRoot, encoding: "utf8" });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  return join(root, "dist");
}

test("with only one featured Setup, the newest unfeatured Setups fill the homepage", async ({ page }) => {
  const fixture = "one-featured-setup";
  const dist = buildWithSetups(fixture);
  await page.route(`${fixtureOrigin}/**`, (route) => {
    let file = join(dist, decodeURIComponent(new URL(route.request().url()).pathname));
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) return route.fulfill({ status: 404 });
    return route.fulfill({ body: readFileSync(file), contentType: contentTypes[extname(file)] });
  });

  await page.goto(`${fixtureOrigin}/`);
  const cards = page.getByRole("list", { name: "Featured Setups" }).getByRole("listitem");
  const expected = homepageCaptions(readSetups(join(import.meta.dirname, fixture)));

  expect(expected).toEqual(["Featured but oldest", "Newest unfeatured", "Second newest unfeatured"]);
  await expect(cards).toHaveCount(3);
  for (const [index, caption] of expected.entries()) {
    await expect(cards.nth(index)).toContainText(caption);
  }
});
