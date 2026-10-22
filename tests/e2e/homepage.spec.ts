import { expect, test, type Locator } from "@playwright/test";
import { dollars, readPackagesInOrder, readWeddingPackagesInOrder } from "./packages";
import { homepageCaptions, readSetups } from "./setups";

const featuredCaptions = homepageCaptions(readSetups());
const cheapest = Math.min(...readPackagesInOrder().map((pkg) => pkg.price));
const cheapestWedding = Math.min(...readWeddingPackagesInOrder().map((pkg) => pkg.price));

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function top(locator: Locator): Promise<number> {
  await expect(locator).toBeVisible();
  return (await locator.boundingBox())!.y;
}

test("the sections appear top to bottom: hero, featured Setups, Packages, Service area, closing inquiry", async ({ page }) => {
  const main = page.getByRole("main");
  const sections = [
    main.getByText("We create. You celebrate."),
    main.getByRole("heading", { name: "Featured Setups" }),
    main.getByRole("heading", { name: `Packages from ${dollars(cheapest)}` }),
    main.getByText("Based in North York, serving the whole GTA."),
    main.getByRole("heading", { name: "Planning an event?" }),
  ];

  const tops = [];
  for (const section of sections) tops.push(await top(section));

  expect(tops).toEqual(tops.toSorted((a, b) => a - b));
});

test("the hero shows the logo, the tagline, an arch-framed photo and a Get a quote button", async ({ page }) => {
  const main = page.getByRole("main");

  await expect(main.getByRole("heading", { level: 1, name: "Likha Events" })).toBeAttached();
  await expect(main.getByText("We create. You celebrate.")).toBeVisible();
  await expect(main.getByRole("img", { name: featuredCaptions[0], exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "Get a quote" })).toBeVisible();
});

test("the featured Setups are the featured ones newest first, topped up with the newest others", async ({ page }) => {
  const cards = page.getByRole("list", { name: "Featured Setups" }).getByRole("listitem");

  await expect(cards).toHaveCount(featuredCaptions.length);
  for (const [index, caption] of featuredCaptions.entries()) {
    await expect(cards.nth(index)).toContainText(caption);
  }
});

test('"Packages from $X" shows the cheapest Package\'s price and mentions Rentals', async ({ page }) => {
  const teaser = page.getByRole("region", { name: `Packages from ${dollars(cheapest)}` });

  await expect(teaser).toBeVisible();
  await expect(teaser).toContainText("Rentals");
});

test('"Wedding Packages from $Y" shows the cheapest Wedding Package\'s price and leads to their section', async ({
  page,
}) => {
  const teaser = page.getByRole("region", { name: `Packages from ${dollars(cheapest)}` });

  await teaser.getByRole("link", { name: `Wedding Packages from ${dollars(cheapestWedding)}` }).click();

  await expect(page).toHaveURL("/packages-and-rentals/#wedding-packages");
  await expect(page.getByRole("region", { name: `Wedding Packages from ${dollars(cheapestWedding)}` })).toBeInViewport();
});

test("the closing section links to Instagram", async ({ page }) => {
  const closing = page.getByRole("region", { name: "Planning an event?" });

  await expect(closing.getByRole("link", { name: /Instagram/ })).toHaveAttribute("href", "https://www.instagram.com/likha.events");
});

const links = [
  { region: undefined, name: "Get a quote", path: "/contact/" },
  { region: "Featured Setups", name: "See the gallery", path: "/gallery/" },
  { region: `Packages from ${dollars(cheapest)}`, name: "See Packages & Rentals", path: "/packages-and-rentals/" },
  { region: "Planning an event?", name: "Send an inquiry", path: "/contact/" },
];

for (const { region, name, path } of links) {
  test(`"${name}" leads to ${path}`, async ({ page }) => {
    const within = region ? page.getByRole("region", { name: region }) : page.getByRole("main");

    await within.getByRole("link", { name }).click();

    await expect(page).toHaveURL(path);
  });
}
