import { expect, test, type Page } from "@playwright/test";
import { menuPages } from "./site-pages";

// On phones the menu sits behind a menu button; on wider screens it is always shown.
async function openMenuIfCollapsed(page: Page) {
  const menuButton = page.getByRole("button", { name: "Menu" });
  if ((await menuButton.isVisible()) && (await menuButton.getAttribute("aria-expanded")) === "false") {
    await menuButton.click();
  }
}

test("the menu reaches all four pages and marks the current one", async ({ page }) => {
  await page.goto("/");

  for (const { name, path } of menuPages) {
    await openMenuIfCollapsed(page);
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name, exact: true }).click();

    await expect(page).toHaveURL(path);
    await openMenuIfCollapsed(page);
    const current = page.getByRole("navigation", { name: "Main" }).locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(name);
  }
});

test.describe("on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu only collapses below tablet width");

  test("the menu button opens and closes the menu", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu" });
    const galleryLink = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gallery" });

    await expect(galleryLink).toBeHidden();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();
    await expect(galleryLink).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    await menuButton.click();
    await expect(galleryLink).toBeHidden();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape closes the open menu and returns focus to the menu button", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.click();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gallery" })).toBeHidden();
    await expect(menuButton).toBeFocused();
  });

  // The open menu lies over the page, so it gets out of the way once the visitor moves on.
  test("a tap outside the open menu closes it", async ({ page }) => {
    await page.goto("/");
    const galleryLink = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gallery" });
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(galleryLink).toBeVisible();

    await page.getByRole("contentinfo").click();

    await expect(galleryLink).toBeHidden();
  });

  test("tabbing on past the last link closes the menu", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.click();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Contact" }).focus();

    await page.keyboard.press("Tab");

    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("on a desktop", () => {
  test.skip(({ isMobile }) => isMobile, "covered by the phone tests");

  test("the menu is shown without a menu button", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link")).toHaveCount(4);
  });
});
