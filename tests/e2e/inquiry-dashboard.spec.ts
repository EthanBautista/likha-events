import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { listInquiries } from "../../netlify/functions/inquiries";
import { inquiryPhoto } from "../../netlify/functions/inquiry-photo";
import type { FormSubmission } from "../../netlify/inquiries";
import { gitHubStub } from "../functions/github";
import { startLocalStore, type LocalStore } from "../functions/local-store";

// The Inquiry dashboard at /admin/inquiries/. The dashboard's requests to its functions run the real
// function code here, against a local Blobs store, with GitHub's answer substituted: "push-token"
// can push to the repo and "read-token" can only read it. Netlify's GitHub sign-in window is
// replaced by one that hands back a chosen token the way Netlify's does.

const dashboard = "/admin/inquiries/";

let local: LocalStore;

test.beforeEach(async ({ context }) => {
  local = await startLocalStore();
  await serveFunctions(context);
});

test.afterEach(async () => {
  await local.stop();
});

/** Answers the dashboard's function requests with the functions' own code. */
async function serveFunctions(context: BrowserContext) {
  const functions = {
    "**/api/inquiries": listInquiries(() => local.inquiries(), gitHubStub),
    "**/api/inquiry-photos/*": inquiryPhoto(() => local.inquiries(), gitHubStub),
  };
  for (const [url, handler] of Object.entries(functions)) {
    await context.route(url, async (route) => {
      const response = await handler(new Request(route.request().url(), { headers: route.request().headers() }));
      await route.fulfill({
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: Buffer.from(await response.arrayBuffer()),
      });
    });
  }
}

/** Makes Netlify's GitHub sign-in window hand back this token, after the same handshake Netlify's does. */
async function gitHubSignsInWith(context: BrowserContext, token: string) {
  await context.route("https://api.netlify.com/auth**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><title>Sign in</title><script>
        addEventListener("message", (event) => {
          if (event.data !== "authorizing:github") return;
          const data = JSON.stringify({ token: ${JSON.stringify(token)}, provider: "github" });
          window.opener.postMessage("authorization:github:success:" + data, event.origin);
        });
        window.opener.postMessage("authorizing:github", "*");
      </script>`,
    }),
  );
}

const signInButton = (page: Page) => page.getByRole("button", { name: "Sign in with GitHub" });

async function signIn(page: Page, context: BrowserContext, token: string) {
  await gitHubSignsInWith(context, token);
  await page.goto(dashboard);
  await signInButton(page).click();
}

test("the dashboard is kept out of search engines", async ({ page }) => {
  await page.goto(dashboard);

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
});

test("the dashboard asks to sign in with GitHub, and shows no Inquiries until then", async ({ page }) => {
  await page.goto(dashboard);

  await expect(page.getByRole("heading", { name: "Inquiries", level: 1 })).toBeVisible();
  await expect(signInButton(page)).toBeVisible();
  await expect(page.getByText("No Inquiries yet")).toBeHidden();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeHidden();
});

test("after signing in with GitHub, the dashboard shows that there are no Inquiries yet", async ({ page, context }) => {
  await signIn(page, context, "push-token");

  await expect(page.getByText("No Inquiries yet")).toBeVisible();
  await expect(signInButton(page)).toBeHidden();
});

test("the dashboard stays signed in when the page is opened again", async ({ page, context }) => {
  await signIn(page, context, "push-token");
  await expect(page.getByText("No Inquiries yet")).toBeVisible();

  await page.goto(dashboard);

  await expect(page.getByText("No Inquiries yet")).toBeVisible();
  await expect(signInButton(page)).toBeHidden();
});

test("signing out asks to sign in again", async ({ page, context }) => {
  await signIn(page, context, "push-token");
  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(signInButton(page)).toBeVisible();
  await expect(page.getByText("No Inquiries yet")).toBeHidden();

  await page.goto(dashboard);
  await expect(signInButton(page)).toBeVisible();
});

test("a GitHub account that can't push to the site's repo is told so, and shown no Inquiries", async ({ page, context }) => {
  await signIn(page, context, "read-token");

  await expect(page.getByRole("alert")).toContainText("can't see Inquiries");
  await expect(page.getByText("No Inquiries yet")).toBeHidden();
  await expect(signInButton(page)).toBeVisible();
});

test("a sign-in GitHub no longer recognises asks to sign in again", async ({ page, context }) => {
  await signIn(page, context, "expired-token");

  await expect(page.getByRole("alert")).toContainText("Sign in again");
  await expect(signInButton(page)).toBeVisible();
});

test("the dashboard links to the editor", async ({ page }) => {
  await page.goto(dashboard);

  await expect(page.getByRole("link", { name: "Editor" })).toHaveAttribute("href", "/admin/");
});

test("the dashboard does not scroll sideways, signed out or in", async ({ page, context }) => {
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

  await page.goto(dashboard);
  expect(await overflow()).toBeLessThanOrEqual(0);

  await signIn(page, context, "push-token");
  await expect(page.getByText("No Inquiries yet")).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
});

test("the dashboard meets WCAG AA, signed out and in", async ({ page, context }) => {
  const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  await page.goto(dashboard);
  expect((await axe()).violations).toEqual([]);

  await signIn(page, context, "push-token");
  await expect(page.getByText("No Inquiries yet")).toBeVisible();
  expect((await axe()).violations).toEqual([]);
});

// Inquiries arriving from the contact form, as Netlify hands them to the submission-created function.

/** A date some days from today in Toronto, as the contact form sends it. */
function daysFromToday(days: number) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** A 1×1 PNG, standing in for a customer's inspiration photo. */
const photoBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

/** Netlify's links to uploaded files: any file is served, except ones whose link has expired. */
const netlifyFiles = async (url: string) =>
  url.includes("expired")
    ? new Response("Gone", { status: 403 })
    : new Response(photoBytes, { headers: { "Content-Type": "image/png" } });

let received = 0;

async function inquiryArrives(data: Record<string, unknown>) {
  received += 1;
  const submission: FormSubmission = {
    id: `submission-${received}`,
    form_name: "inquiry",
    created_at: new Date(Date.UTC(2026, 9, 1) + received * 60_000).toISOString(),
    data: { contact: "maria@example.com", ...data },
  };
  await local.inquiries(netlifyFiles).receive(submission);
}

const upload = (filename: string) => ({
  filename,
  type: "image/png",
  url: `https://netlify-forms.example/uploads/${filename}`,
});

const rows = (page: Page) => page.locator(".inquiry-row");

async function inquiriesArrive() {
  await inquiryArrives({ name: "Past Customer", "event-date": daysFromToday(-20), "event-type": "Birthday" });
  await inquiryArrives({ name: "Later Customer", "event-date": daysFromToday(40), "event-type": "Birthday" });
  await inquiryArrives({ name: "Undated Customer" });
  await inquiryArrives({
    name: "Maria Santos",
    contact: "416-555-0134",
    "event-date": daysFromToday(10),
    venue: "Mississauga",
    "event-type": "Baby shower",
    guests: "40",
    theme: "Sage and gold",
    decor: "A balloon arch\nand a backdrop with her name",
    "inspiration-photo-1": upload("arch.png"),
    "inspiration-photo-2": upload("expired-cake.png"),
  });
}

test("Inquiries from the contact form are listed as New, upcoming events soonest first, then past ones, then undated", async ({
  page,
  context,
}) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");

  await expect(rows(page)).toHaveCount(4);
  await expect(rows(page).nth(0)).toContainText("Maria Santos");
  await expect(rows(page).nth(0)).toContainText("Baby shower");
  await expect(rows(page).nth(0)).toContainText("New");
  await expect(rows(page).nth(1)).toContainText("Later Customer");
  await expect(rows(page).nth(2)).toContainText("Past Customer");
  await expect(rows(page).nth(3)).toContainText("Undated Customer");
  await expect(page.getByRole("region", { name: "Upcoming" }).locator(".inquiry-row")).toHaveCount(2);
  await expect(page.getByRole("region", { name: "Past" }).locator(".inquiry-row")).toHaveCount(1);
  await expect(page.getByRole("region", { name: "No date yet" }).locator(".inquiry-row")).toHaveCount(1);
  await expect(page.getByText("No Inquiries yet")).toBeHidden();
});

test("each row shows the event's date", async ({ page, context }) => {
  await inquiryArrives({ name: "Maria Santos", "event-date": "2099-11-14", "event-type": "Baby shower" });
  await signIn(page, context, "push-token");

  await expect(rows(page)).toContainText("Nov");
  await expect(rows(page)).toContainText("14");
  await expect(rows(page)).toContainText("Sat, 2099");
});

test("opening an Inquiry shows everything the customer sent, with its photos", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");

  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await expect(page.getByRole("heading", { name: "Maria Santos", level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\?inquiry=submission-\d+$/);
  const answers = page.locator(".inquiry-answers");
  await expect(answers).toContainText("Phone number or email416-555-0134");
  await expect(page.getByRole("link", { name: "416-555-0134" })).toHaveAttribute("href", "tel:4165550134");
  await expect(answers).toContainText("Venue or cityMississauga");
  await expect(answers).toContainText("Event typeBaby shower");
  await expect(answers).toContainText("Number of guests40");
  await expect(answers).toContainText("Theme or coloursSage and gold");
  await expect(answers).toContainText("A balloon arch\nand a backdrop with her name");
  await expect(page.getByText(/^New Received .+ · Contact form$/)).toBeVisible();

  const photo = page.getByRole("img", { name: "Inspiration photo 1 from Maria Santos" });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1);
  await expect(page.getByText("This photo couldn't be saved. It's still in the email.")).toBeVisible();
  await expect(page.getByText("expired-cake.png")).toBeVisible();
});

test("an Inquiry's optional answers left empty say so", async ({ page, context }) => {
  await inquiryArrives({ name: "Joy Reyes", contact: "joy@example.com" });
  await signIn(page, context, "push-token");

  await rows(page).click();

  await expect(page.getByRole("link", { name: "joy@example.com" })).toHaveAttribute("href", "mailto:joy@example.com");
  await expect(page.locator(".inquiry-answers")).toContainText("Event dateNot given");
  await expect(page.getByText("No photos sent.")).toBeVisible();
});

test("from an Inquiry, All Inquiries and the back button return to the list", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");

  await rows(page).first().click();
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await expect(page.getByRole("heading", { name: "Inquiries", level: 1 })).toBeVisible();
  await expect(rows(page)).toHaveCount(4);

  await rows(page).first().click();
  await expect(page.getByRole("heading", { name: "Maria Santos", level: 1 })).toBeVisible();
  await page.goBack();
  await expect(rows(page)).toHaveCount(4);
  await expect(page.getByRole("link", { name: "All Inquiries" })).toBeHidden();
});

test("an Inquiry's own link opens it again, and one that isn't there says so", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).first().click();
  await expect(page.getByRole("heading", { name: "Maria Santos", level: 1 })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Maria Santos", level: 1 })).toBeVisible();

  await page.goto(`${dashboard}?inquiry=no-such-inquiry`);
  await expect(page.getByRole("alert")).toContainText("This Inquiry isn't here any more.");
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await expect(rows(page)).toHaveCount(4);
});

test("the list and an opened Inquiry don't scroll sideways, and meet WCAG AA", async ({ page, context }) => {
  const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await inquiriesArrive();
  await inquiryArrives({ name: "A customer with a very long name that goes on and on past the edge of a phone" });
  await signIn(page, context, "push-token");

  await expect(rows(page)).toHaveCount(5);
  expect(await overflow()).toBeLessThanOrEqual(0);
  expect((await axe()).violations).toEqual([]);

  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await expect(page.getByRole("img", { name: "Inspiration photo 1 from Maria Santos" })).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
  expect((await axe()).violations).toEqual([]);
});
