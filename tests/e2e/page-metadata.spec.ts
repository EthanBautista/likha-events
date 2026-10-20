import { expect, test } from "@playwright/test";
import { sitePages } from "./site-pages";

for (const { name, path } of sitePages) {
  test(`${name} has its own title, description and link-preview tags`, async ({ page }) => {
    await page.goto(path);
    const metaContent = (selector: string) => page.locator(selector).getAttribute("content");

    await expect(page).toHaveTitle(`${name} · Likha Events`);
    const description = await metaContent('meta[name="description"]');
    expect(description?.length).toBeGreaterThan(40);

    expect(await metaContent('meta[property="og:title"]')).toBe(`${name} · Likha Events`);
    expect(await metaContent('meta[property="og:description"]')).toBe(description);
    expect(await metaContent('meta[property="og:type"]')).toBe("website");
    expect(await metaContent('meta[property="og:site_name"]')).toBe("Likha Events");
    expect(await metaContent('meta[property="og:url"]')).toBe(`https://likhaevents.ca${path}`);
    expect(await metaContent('meta[property="og:image"]')).toMatch(/^https:\/\/likhaevents\.ca\/.+\.(png|jpg)$/);
    expect(await metaContent('meta[property="og:image:alt"]')).toBeTruthy();
  });
}

test("every page has a different description", async ({ page }) => {
  const descriptions = new Set<string | null>();
  for (const { path } of sitePages) {
    await page.goto(path);
    descriptions.add(await page.locator('meta[name="description"]').getAttribute("content"));
  }
  expect(descriptions.size).toBe(sitePages.length);
});
