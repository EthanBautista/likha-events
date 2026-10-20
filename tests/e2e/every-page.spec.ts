import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { allPages } from "./site-pages";

for (const { name, path } of allPages) {
  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test("the footer links to Instagram and Facebook", async ({ page }) => {
      const footer = page.getByRole("contentinfo");

      await expect(footer.getByRole("link", { name: /Instagram/ })).toHaveAttribute(
        "href",
        "https://www.instagram.com/likha.events",
      );
      await expect(footer.getByRole("link", { name: /Facebook/ })).toHaveAttribute(
        "href",
        "https://www.facebook.com/p/LIKHA-Events-61581441256098/",
      );
    });

    test("does not show a phone number", async ({ page }) => {
      // North American numbers such as 416 555 0199, (416) 555-0199 or +1 416.555.0199.
      const phoneNumber = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
      const metaContent = await page
        .locator("meta[content]")
        .evaluateAll((metas) => metas.map((meta) => meta.getAttribute("content")).join("\n"));

      // textContent, not innerText, so text hidden on this viewport (such as the closed phone menu) is checked too.
      expect(await page.locator("body").textContent()).not.toMatch(phoneNumber);
      expect(metaContent).not.toMatch(phoneNumber);
      await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    });

    test("does not scroll sideways", async ({ page }) => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("meets WCAG AA, including text contrast", async ({ page }) => {
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

      expect(results.violations).toEqual([]);
    });
  });
}
