import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { addInquiry } from "../../netlify/functions/add-inquiry";
import { addInquiryPhoto } from "../../netlify/functions/add-inquiry-photo";
import { deleteInquiry } from "../../netlify/functions/delete-inquiry";
import { changeInquiry } from "../../netlify/functions/inquiry";
import { listInquiries } from "../../netlify/functions/inquiries";
import { inquiryPhoto } from "../../netlify/functions/inquiry-photo";
import type { FormSubmission, Inquiry } from "../../netlify/inquiries";
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

/** Answers the dashboard's function requests with the functions' own code, each by its path and method. */
async function serveFunctions(context: BrowserContext) {
  const inquiries = () => local.inquiries();
  const functions: Record<string, Record<string, (request: Request) => Promise<Response>>> = {
    "**/api/inquiries": { GET: listInquiries(inquiries, gitHubStub), POST: addInquiry(inquiries, gitHubStub) },
    "**/api/inquiries/*": { PATCH: changeInquiry(inquiries, gitHubStub), DELETE: deleteInquiry(inquiries, gitHubStub) },
    "**/api/inquiries/*/photos": { POST: addInquiryPhoto(inquiries, gitHubStub) },
    "**/api/inquiry-photos/*": { GET: inquiryPhoto(inquiries, gitHubStub) },
  };
  for (const [url, byMethod] of Object.entries(functions)) {
    await context.route(url, async (route) => {
      const request = route.request();
      const handler = byMethod[request.method()];
      if (!handler) return route.fulfill({ status: 404 });
      // As bytes, so a photo sent in a form arrives whole.
      const body = request.postDataBuffer();
      const response = await handler(
        new Request(request.url(), { method: request.method(), headers: request.headers(), body: body && new Uint8Array(body) }),
      );
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
  await expect(page.getByText(/^Received .+ · Contact form$/)).toBeVisible();
  await expect(statusChoice(page, "New")).toBeChecked();

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

// Working through Inquiries: the owner sets an Inquiry status, filters the list by it and writes notes.

const statusChoice = (page: Page, status: string) =>
  page.getByRole("group", { name: "Inquiry status" }).getByRole("radio", { name: status, exact: true });

const notes = (page: Page) => page.getByRole("textbox", { name: "Notes" });

/** The dashboard saying a change was saved. */
const says = (page: Page, message: string) => page.getByRole("status").filter({ hasText: message });

test("an opened Inquiry can be set to any Inquiry status, and keeps it", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await expect(statusChoice(page, "New")).toBeChecked();

  for (const status of ["Booked", "Quoted", "Declined", "Done", "New", "Booked"]) {
    await statusChoice(page, status).check();
    await expect(says(page, `Set to ${status}`)).toBeVisible();
  }

  await page.reload();
  await expect(statusChoice(page, "Booked")).toBeChecked();
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await expect(rows(page).filter({ hasText: "Maria Santos" })).toContainText("Booked");
});

const filterButton = (page: Page, name: string) =>
  page.getByRole("group", { name: "Filter by Inquiry status" }).getByRole("button", { name, exact: true });

/** Sets the Inquiry status of the Inquiry from this customer, as the owner would have. */
async function setStatus(name: string, status: Inquiry["status"]) {
  const inquiries = local.inquiries();
  const { id } = (await inquiries.list()).find((inquiry) => inquiry.name === name)!;
  await inquiries.change(id, { status });
}

test("the list can be filtered by Inquiry status, showing All at first, and the filter is kept in the address", async ({
  page,
  context,
}) => {
  await inquiriesArrive();
  await setStatus("Later Customer", "Quoted");
  await setStatus("Past Customer", "Quoted");
  await setStatus("Undated Customer", "Booked");
  await signIn(page, context, "push-token");

  await expect(filterButton(page, "All")).toHaveAttribute("aria-pressed", "true");
  await expect(rows(page)).toHaveCount(4);

  await filterButton(page, "Quoted").click();
  await expect(filterButton(page, "Quoted")).toHaveAttribute("aria-pressed", "true");
  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).nth(0)).toContainText("Later Customer");
  await expect(rows(page).nth(1)).toContainText("Past Customer");
  await expect(page).toHaveURL(/\?status=Quoted$/);

  await page.reload();
  await expect(rows(page)).toHaveCount(2);
  await rows(page).first().click();
  await page.goBack();
  await expect(rows(page)).toHaveCount(2);

  await filterButton(page, "Declined").click();
  await expect(rows(page)).toHaveCount(0);
  await expect(page.getByText("No Declined Inquiries")).toBeVisible();

  await filterButton(page, "All").click();
  await expect(rows(page)).toHaveCount(4);
  await expect(page).toHaveURL(/\/admin\/inquiries\/$/);
});

test("the number of New Inquiries is always shown, whatever the filter, and follows each change of status", async ({
  page,
  context,
}) => {
  await inquiriesArrive();
  await setStatus("Past Customer", "Done");
  await signIn(page, context, "push-token");
  await expect(page.getByText("3 New Inquiries", { exact: true })).toBeVisible();

  await filterButton(page, "Done").click();
  await expect(page.getByText("3 New Inquiries", { exact: true })).toBeVisible();

  await filterButton(page, "All").click();
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await statusChoice(page, "Quoted").check();
  await expect(says(page, "Set to Quoted")).toBeVisible();
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await expect(page.getByText("2 New Inquiries", { exact: true })).toBeVisible();

  await setStatus("Later Customer", "Quoted");
  await page.reload();
  await expect(page.getByText("1 New Inquiry", { exact: true })).toBeVisible();

  await setStatus("Undated Customer", "Declined");
  await page.reload();
  await expect(page.getByText("No New Inquiries", { exact: true })).toBeVisible();
});

test("notes written on an opened Inquiry are saved with it, and can be rewritten", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await expect(notes(page)).toHaveValue("");

  await notes(page).fill("Wants gold balloons.\nCall after 6pm.");
  await page.getByRole("button", { name: "Save notes" }).click();
  await expect(says(page, "Notes saved")).toBeVisible();

  await page.reload();
  await expect(notes(page)).toHaveValue("Wants gold balloons.\nCall after 6pm.");

  // Leaving the Inquiry saves notes not yet saved.
  await notes(page).fill("Quoted $650 by text.");
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await expect(notes(page)).toHaveValue("Quoted $650 by text.");
  await page.reload();
  await expect(notes(page)).toHaveValue("Quoted $650 by text.");
});

test("a change that can't be saved says so, and the Inquiry shows what is saved", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await context.route("**/api/inquiries/*", (route) => route.abort());

  // Chosen, it goes straight back to the status that's saved.
  await statusChoice(page, "Booked").click();

  await expect(page.getByRole("alert")).toContainText("Couldn't reach the dashboard");
  await expect(statusChoice(page, "New")).toBeChecked();
});

// Inquiries the owner adds by hand, from Instagram or Facebook messages.

const addButton = (page: Page) => page.getByRole("link", { name: "Add Inquiry" });
const field = (page: Page, label: string) => page.locator(".inquiry-form").getByLabel(new RegExp(`^${label}`));

test("an Inquiry from Instagram can be added with only a name and a way to reach them, and starts as New", async ({
  page,
  context,
}) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");

  await addButton(page).click();
  await expect(page.getByRole("heading", { name: "Add an Inquiry", level: 1 })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Instagram" })).toBeChecked();
  await field(page, "Name").fill("Joy Reyes");
  await field(page, "Phone, email or handle").fill("@joyreyes");
  await page.getByRole("button", { name: "Add Inquiry" }).click();

  await expect(page.getByRole("heading", { name: "Joy Reyes", level: 1 })).toBeVisible();
  await expect(page.getByText(/^Added .+ · Instagram$/)).toBeVisible();
  await expect(statusChoice(page, "New")).toBeChecked();
  await expect(page.locator(".inquiry-answers")).toContainText("Phone, email or handle@joyreyes");
  await expect(page.locator(".inquiry-answers")).toContainText("Event dateNot given");
  await expect(page.getByText("No photos added.")).toBeVisible();

  // Kept, and listed with the Inquiries that have no date yet, after every dated one, newest first.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Joy Reyes", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await expect(rows(page)).toHaveCount(5);
  await expect(rows(page).nth(3)).toContainText("Joy Reyes");
  await expect(rows(page).nth(3)).toContainText("Instagram");
  await expect(rows(page).nth(4)).toContainText("Undated Customer");
  await expect(rows(page).nth(4)).toContainText("Contact form");
  await expect(page.getByRole("region", { name: "No date yet" }).locator(".inquiry-row")).toHaveCount(2);
  await expect(page.getByText("5 New Inquiries", { exact: true })).toBeVisible();
});

test("an Inquiry can't be added without a name and a way to reach them", async ({ page, context }) => {
  await signIn(page, context, "push-token");
  await addButton(page).click();

  await page.getByRole("button", { name: "Add Inquiry" }).click();

  await expect(page.getByText("Enter the customer's name.")).toBeVisible();
  await expect(page.getByText("Enter a way to reach them")).toBeVisible();
  await expect(field(page, "Name")).toBeFocused();
  await field(page, "Name").fill("Joy Reyes");
  await expect(page.getByText("Enter the customer's name.")).toBeHidden();

  await page.getByRole("link", { name: "Cancel" }).click();
  await expect(page.getByText("No Inquiries yet")).toBeVisible();
  expect(await local.inquiries().list()).toEqual([]);
});

/** A screenshot from a chat, as the owner picks it on their phone. */
const screenshot = (name: string) => ({ name, mimeType: "image/png", buffer: photoBytes });

test("an Inquiry from Facebook can be added with all its details and photos", async ({ page, context }) => {
  await signIn(page, context, "push-token");
  await addButton(page).click();

  await page.getByText("Facebook", { exact: true }).click();
  await field(page, "Name").fill("Joy Reyes");
  await field(page, "Phone, email or handle").fill("facebook.com/joy.reyes");
  await field(page, "Event date").fill(daysFromToday(30));
  await field(page, "Venue or city").fill("Brampton");
  await field(page, "Event type").selectOption("Birthday");
  await field(page, "Number of guests").fill("60");
  await field(page, "Theme or colours").fill("Pink and white");
  await field(page, "Décor wanted").fill("A balloon garland");
  await field(page, "Inspiration photos").setInputFiles([screenshot("chat.png"), screenshot("cake.png")]);
  await page.getByRole("button", { name: "Add Inquiry" }).click();

  await expect(page.getByRole("heading", { name: "Joy Reyes", level: 1 })).toBeVisible();
  await expect(says(page, "Inquiry added")).toBeVisible();
  await expect(page.getByText(/^Added .+ · Facebook$/)).toBeVisible();
  const answers = page.locator(".inquiry-answers");
  await expect(answers).toContainText("Venue or cityBrampton");
  await expect(answers).toContainText("Event typeBirthday");
  await expect(answers).toContainText("Number of guests60");
  await expect(answers).toContainText("Theme or coloursPink and white");
  await expect(answers).toContainText("Décor wantedA balloon garland");
  for (const number of [1, 2]) {
    const photo = page.getByRole("img", { name: `Inspiration photo ${number} from Joy Reyes` });
    await expect(photo).toBeVisible();
    expect(await photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1);
  }
  await expect(page.getByText("chat.png")).toBeVisible();

  await page.getByRole("link", { name: "All Inquiries" }).click();
  await expect(page.getByRole("region", { name: "Upcoming" }).locator(".inquiry-row")).toContainText("Facebook");
});

test("an Inquiry takes as many photos as the contact form", async ({ page, context }) => {
  await signIn(page, context, "push-token");
  await addButton(page).click();

  await field(page, "Name").fill("Joy Reyes");
  await field(page, "Phone, email or handle").fill("@joyreyes");
  await field(page, "Inspiration photos").setInputFiles(["1.png", "2.png", "3.png", "4.png"].map(screenshot));
  await page.getByRole("button", { name: "Add Inquiry" }).click();

  await expect(page.getByText("Choose up to 3 images.")).toBeVisible();
  expect(await local.inquiries().list()).toEqual([]);
});

test("an added Inquiry's details can be filled in and changed later, and more photos added", async ({ page, context }) => {
  await inquiriesArrive();
  await local.inquiries().add({ source: "Instagram", name: "Joy", contact: "@joyreyes", venue: "Brampton" });
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Joy" }).click();
  await notes(page).fill("Wants pink.");

  await page.getByRole("link", { name: "Edit details" }).click();
  await expect(page.getByRole("heading", { name: "Edit details", level: 1 })).toBeVisible();
  await expect(field(page, "Name")).toHaveValue("Joy");
  await expect(field(page, "Venue or city")).toHaveValue("Brampton");
  await page.getByText("Facebook", { exact: true }).click();
  await field(page, "Name").fill("Joy Reyes");
  await field(page, "Event date").fill(daysFromToday(5));
  await field(page, "Venue or city").fill("");
  await field(page, "Inspiration photos").setInputFiles([screenshot("chat.png")]);
  await page.getByRole("button", { name: "Save details" }).click();

  await expect(page.getByRole("heading", { name: "Joy Reyes", level: 1 })).toBeVisible();
  await expect(says(page, "Details saved")).toBeVisible();
  await expect(page.getByText(/^Added .+ · Facebook$/)).toBeVisible();
  await expect(page.locator(".inquiry-answers")).toContainText("Venue or cityNot given");
  await expect(page.getByRole("img", { name: "Inspiration photo 1 from Joy Reyes" })).toBeVisible();
  await expect(notes(page)).toHaveValue("Wants pink.");

  // Back from the Inquiry returns to the list, not to the form, with the Inquiry moved to its new date.
  await page.goBack();
  await expect(rows(page).first()).toContainText("Joy Reyes");
  await page.reload();
  await expect(rows(page).first()).toContainText("Joy Reyes");
  await rows(page).first().click();
  await expect(notes(page)).toHaveValue("Wants pink.");
  await expect(page.locator(".inquiry-answers")).toContainText("Venue or cityNot given");
});

test("a contact-form Inquiry's answers can't be edited", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");

  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await expect(page.getByRole("heading", { name: "What they sent" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit details" })).toBeHidden();
});

test("the form for adding an Inquiry doesn't scroll sideways, and meets WCAG AA", async ({ page, context }) => {
  const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await signIn(page, context, "push-token");
  await addButton(page).click();
  await page.getByRole("button", { name: "Add Inquiry" }).click();
  await expect(page.getByText("Enter the customer's name.")).toBeVisible();

  expect(await overflow()).toBeLessThanOrEqual(0);
  expect((await axe()).violations).toEqual([]);
});

// Deleting an Inquiry, such as spam that slipped through or a duplicate.

const deleteButton = (page: Page) => page.getByRole("button", { name: "Delete Inquiry" });
const confirmStep = (page: Page) => page.getByRole("region", { name: "Delete the Inquiry from Maria Santos?" });

test("deleting an Inquiry asks first, naming it and pointing to Declined, and cancelling keeps it", async ({ page, context }) => {
  const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await deleteButton(page).click();

  await expect(confirmStep(page)).toBeVisible();
  await expect(confirmStep(page)).toContainText("photos");
  await expect(confirmStep(page)).toContainText("didn't book");
  await expect(confirmStep(page).getByRole("button", { name: "Set to Declined instead" })).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
  expect((await axe()).violations).toEqual([]);

  await confirmStep(page).getByRole("button", { name: "Keep it" }).click();
  await expect(confirmStep(page)).toBeHidden();
  await expect(deleteButton(page)).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Maria Santos", level: 1 })).toBeVisible();
  expect(await local.inquiries().list()).toHaveLength(4);
});

test("a confirmed delete removes the Inquiry and its photos, and returns to the list", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await expect(page.getByRole("img", { name: "Inspiration photo 1 from Maria Santos" })).toBeVisible();

  await deleteButton(page).click();
  await confirmStep(page).getByRole("button", { name: "Delete for good" }).click();

  await expect(page.getByRole("heading", { name: "Inquiries", level: 1 })).toBeVisible();
  await expect(says(page, "Deleted the Inquiry from Maria Santos")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Inquiries", level: 1 })).toBeFocused();
  await expect(rows(page)).toHaveCount(3);
  await expect(rows(page).filter({ hasText: "Maria Santos" })).toHaveCount(0);
  await expect(page.getByText("3 New Inquiries", { exact: true })).toBeVisible();
  expect((await local.inquiries().list()).map(({ name }) => name)).not.toContain("Maria Santos");
  expect((await local.store("inquiry-photos").list()).blobs).toEqual([]);

  await page.reload();
  await expect(rows(page)).toHaveCount(3);
});

test("a customer who didn't book can be set to Declined from the confirm step instead, and is kept", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await deleteButton(page).click();
  await confirmStep(page).getByRole("button", { name: "Set to Declined instead" }).click();

  await expect(says(page, "Set to Declined")).toBeVisible();
  await expect(statusChoice(page, "Declined")).toBeChecked();
  await expect(confirmStep(page)).toBeHidden();
  const maria = (await local.inquiries().list()).find(({ name }) => name === "Maria Santos");
  expect(maria?.status).toBe("Declined");
});

test("a delete that can't be sent says so, and keeps the Inquiry", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await context.route("**/api/inquiries/*", (route) => route.abort());

  await deleteButton(page).click();
  await confirmStep(page).getByRole("button", { name: "Delete for good" }).click();

  await expect(page.getByRole("alert")).toContainText("Couldn't reach the dashboard");
  await expect(page.getByRole("heading", { name: "Maria Santos", level: 1 })).toBeVisible();
  expect(await local.inquiries().list()).toHaveLength(4);
});

// Money on an Inquiry: the Agreed price, the Down payment and Balance received, its Costs, and what's Owed.

const money = (page: Page) => page.getByRole("form", { name: "Money" });
const amountField = (page: Page, label: string) => money(page).getByLabel(label, { exact: true });
const owedLine = (page: Page) => money(page).locator("[data-owed]");
const cost = (page: Page, number: number) => money(page).getByRole("group", { name: `Cost ${number}`, exact: true });
const saveMoney = (page: Page) => page.getByRole("button", { name: "Save money" });

/** The Inquiry from this customer, as stored. */
const storedInquiry = async (name: string) => (await local.inquiries().list()).find((inquiry) => inquiry.name === name)!;

test("the Agreed price, Down payment and Balance received are entered as written, and kept", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await amountField(page, "Agreed price").fill("$1,250");
  await amountField(page, "Down payment received").fill("625.5");
  await saveMoney(page).click();
  await expect(says(page, "Money saved")).toBeVisible();
  expect(await storedInquiry("Maria Santos")).toMatchObject({ agreedPrice: 125_000, downPayment: 62_550 });

  await page.reload();
  await expect(amountField(page, "Agreed price")).toHaveValue("1250.00");
  await expect(amountField(page, "Down payment received")).toHaveValue("625.50");
  await expect(amountField(page, "Balance received")).toHaveValue("");

  // Changed, and cleared.
  await amountField(page, "Agreed price").fill("1300.05");
  await amountField(page, "Down payment received").fill("");
  await saveMoney(page).click();
  await expect(says(page, "Money saved")).toBeVisible();
  const maria = await storedInquiry("Maria Santos");
  expect(maria.agreedPrice).toBe(130_005);
  expect(maria).not.toHaveProperty("downPayment");
});

test("Owed shows on a Booked or Done Inquiry, follows the amounts entered, and never goes below zero", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await amountField(page, "Agreed price").fill("650");
  await amountField(page, "Down payment received").fill("325");
  await saveMoney(page).click();
  await expect(says(page, "Money saved")).toBeVisible();

  await expect(owedLine(page)).toHaveText("Owed is counted once it's Booked.");
  await statusChoice(page, "Quoted").check();
  await expect(owedLine(page)).toHaveText("Owed is counted once it's Booked.");
  await statusChoice(page, "Booked").check();
  await expect(owedLine(page)).toHaveText("Owed $325.00");

  await amountField(page, "Balance received").fill("300");
  await expect(owedLine(page)).toHaveText("Owed $25.00");
  await amountField(page, "Balance received").fill("400");
  await expect(owedLine(page)).toHaveText("Owed $0.00");

  await statusChoice(page, "Done").check();
  await expect(owedLine(page)).toHaveText("Owed $0.00");
  await statusChoice(page, "Declined").check();
  await expect(owedLine(page)).toHaveText("Owed is counted once it's Booked.");
});

test("a Booked Inquiry with no Agreed price asks for one, and the list shows what's Owed", async ({ page, context }) => {
  await inquiriesArrive();
  await setStatus("Later Customer", "Booked");
  await setStatus("Maria Santos", "Booked");
  const later = await storedInquiry("Later Customer");
  await local.inquiries().change(later.id, { agreedPrice: 80_000, downPayment: 40_000 });
  await signIn(page, context, "push-token");

  await expect(rows(page).filter({ hasText: "Later Customer" })).toContainText("Owed $400.00");
  await expect(rows(page).filter({ hasText: "Maria Santos" })).not.toContainText("Owed");

  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await expect(owedLine(page)).toHaveText("Enter the Agreed price to see what's Owed.");
});

test("Costs can be added, changed and removed, each with a description and an amount, and are totalled", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await expect(money(page).getByText("No Costs yet.")).toBeVisible();

  await page.getByRole("button", { name: "Add a Cost" }).click();
  await expect(cost(page, 1).getByLabel("What for")).toBeFocused();
  await cost(page, 1).getByLabel("What for").fill("Balloons");
  await cost(page, 1).getByLabel("Amount").fill("84.50");
  await page.getByRole("button", { name: "Add a Cost" }).click();
  await cost(page, 2).getByLabel("What for").fill("Printed sign");
  await cost(page, 2).getByLabel("Amount").fill("35");
  await expect(money(page).getByText("Costs total $119.50")).toBeVisible();
  await saveMoney(page).click();
  await expect(says(page, "Money saved")).toBeVisible();
  expect((await storedInquiry("Maria Santos")).costs).toEqual([
    { description: "Balloons", amount: 8_450 },
    { description: "Printed sign", amount: 3_500 },
  ]);

  await page.reload();
  await expect(cost(page, 2).getByLabel("What for")).toHaveValue("Printed sign");
  await cost(page, 1).getByRole("button", { name: "Remove Cost 1" }).click();
  await expect(cost(page, 1).getByLabel("What for")).toHaveValue("Printed sign");
  await expect(cost(page, 2)).toHaveCount(0);
  await cost(page, 1).getByLabel("Amount").fill("40");
  await expect(money(page).getByText("Costs total $40.00")).toBeVisible();
  await saveMoney(page).click();
  await expect(says(page, "Money saved")).toBeVisible();
  expect((await storedInquiry("Maria Santos")).costs).toEqual([{ description: "Printed sign", amount: 4_000 }]);

  await cost(page, 1).getByRole("button", { name: "Remove Cost 1" }).click();
  await saveMoney(page).click();
  await expect(says(page, "Money saved")).toBeVisible();
  expect(await storedInquiry("Maria Santos")).not.toHaveProperty("costs");
  await expect(money(page).getByText("No Costs yet.")).toBeVisible();
});

test("an amount that isn't one, or a Cost half filled in, says so, and nothing is saved", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await amountField(page, "Agreed price").fill("about 600");
  await page.getByRole("button", { name: "Add a Cost" }).click();
  await cost(page, 1).getByLabel("Amount").fill("20");
  await saveMoney(page).click();

  await expect(money(page).getByText("Enter an amount in dollars, like 650 or 650.50.")).toBeVisible();
  await expect(money(page).getByText("Say what it was for.")).toBeVisible();
  await expect(amountField(page, "Agreed price")).toBeFocused();
  await expect(says(page, "Money saved")).toHaveCount(0);
  expect(await storedInquiry("Maria Santos")).not.toHaveProperty("agreedPrice");

  await amountField(page, "Agreed price").fill("600");
  await expect(money(page).getByText("Enter an amount in dollars")).toBeHidden();
});

test("money not yet saved is saved on leaving the Inquiry", async ({ page, context }) => {
  await inquiriesArrive();
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await amountField(page, "Agreed price").fill("650");
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await expect(amountField(page, "Agreed price")).toHaveValue("650.00");
  await expect.poll(async () => (await storedInquiry("Maria Santos")).agreedPrice).toBe(65_000);
});

test("an Inquiry with money entered doesn't scroll sideways, and meets WCAG AA", async ({ page, context }) => {
  const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await inquiriesArrive();
  await setStatus("Maria Santos", "Booked");
  await signIn(page, context, "push-token");
  await rows(page).filter({ hasText: "Maria Santos" }).click();

  await amountField(page, "Agreed price").fill("1250");
  await page.getByRole("button", { name: "Add a Cost" }).click();
  await cost(page, 1).getByLabel("What for").fill("Balloons and a very long printed sign with her name on it in gold");
  await cost(page, 1).getByLabel("Amount").fill("lots");
  await saveMoney(page).click();
  await expect(money(page).getByText("Enter an amount in dollars")).toBeVisible();

  expect(await overflow()).toBeLessThanOrEqual(0);
  expect((await axe()).violations).toEqual([]);
});

// Earned, Owed and Profit on events, by the month and year of each event.

const totalsLink = (page: Page) => page.getByRole("link", { name: "Totals" });
const year = (page: Page, year: string) => page.getByRole("region", { name: year, exact: true });
const monthRow = (page: Page, inYear: string, month: string) =>
  year(page, inYear)
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader", { name: month, exact: true }) });

/** Stores Inquiries with their money, each for an event on the date given, or with no event date. */
/** An Inquiry added by hand and Booked, with the details given. */
const inquiry = (id: string, name: string, details: Partial<Inquiry>): Inquiry => ({
  id,
  name,
  status: "Booked",
  source: "Instagram",
  receivedAt: "2026-01-05T15:00:00.000Z",
  contact: "@customer",
  photos: [],
  ...details,
});

async function inquiriesWithMoney() {
  const store = local.store("inquiries");
  await store.setJSON("a", inquiry("a", "March Customer", { status: "Done", eventDate: "2026-03-21", agreedPrice: 50_000, downPayment: 25_000, balance: 25_000 }));
  await store.setJSON(
    "b",
    inquiry("b", "October Customer", { eventDate: "2026-10-10", agreedPrice: 80_000, downPayment: 40_000, costs: [{ description: "Flowers", amount: 12_000 }] }),
  );
  await store.setJSON("c", inquiry("c", "Declined Customer", { status: "Declined", eventDate: "2026-10-24", agreedPrice: 60_000, downPayment: 15_000 }));
  await store.setJSON("d", inquiry("d", "Last Year's Customer", { status: "Done", eventDate: "2025-12-31", agreedPrice: 30_000, downPayment: 30_000 }));
  await store.setJSON("e", inquiry("e", "Undated Customer", { downPayment: 10_000 }));
}

test("Totals show Earned, Owed and Profit on events for each year and month of the events", async ({ page, context }) => {
  await inquiriesWithMoney();
  await signIn(page, context, "push-token");
  await totalsLink(page).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Totals");
  await expect(page.getByRole("region")).toHaveText([/2026/, /2025/]);

  const thisYear = year(page, "2026");
  // A Declined customer's Down payment still counts as Earned, though nothing is Owed on it.
  await expect(thisYear.getByRole("definition")).toHaveText(["$1,050.00", "$400.00", "$930.00"]);
  await expect(thisYear.getByRole("term")).toHaveText(["Earned", "Owed", "Profit on events"]);
  await expect(monthRow(page, "2026", "March").getByRole("cell")).toHaveText(["$500.00", "$0.00", "$500.00"]);
  await expect(monthRow(page, "2026", "October").getByRole("cell")).toHaveText(["$550.00", "$400.00", "$430.00"]);
  await expect(year(page, "2026").getByRole("rowheader")).toHaveText(["March", "October"]);
  await expect(monthRow(page, "2025", "December").getByRole("cell")).toHaveText(["$300.00", "$0.00", "$300.00"]);
  await expect(year(page, "2026").getByRole("columnheader")).toHaveText(["Month", "Earned", "Owed", "Profit on events"]);

  await expect(page.getByText("1 Inquiry has no event date, so it's left out of these totals.")).toBeVisible();
});

test("Totals follow money entered on an Inquiry, and All Inquiries returns to the list", async ({ page, context }) => {
  await inquiriesArrive();
  await setStatus("Maria Santos", "Booked");
  await signIn(page, context, "push-token");

  await totalsLink(page).click();
  await expect(page.getByText("1 Inquiry has no event date, so it's left out of these totals.")).toBeVisible();
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await expect(rows(page)).toHaveCount(4);

  await rows(page).filter({ hasText: "Maria Santos" }).click();
  await amountField(page, "Agreed price").fill("650");
  await amountField(page, "Down payment received").fill("325");
  await saveMoney(page).click();
  await expect(says(page, "Money saved")).toBeVisible();
  await page.getByRole("link", { name: "All Inquiries" }).click();
  await totalsLink(page).click();

  const maria = (await storedInquiry("Maria Santos")).eventDate!;
  const month = new Date(`${maria}T12:00:00Z`).toLocaleDateString("en-CA", { month: "long", timeZone: "UTC" });
  await expect(monthRow(page, maria.slice(0, 4), month).getByRole("cell")).toHaveText(["$325.00", "$325.00", "$325.00"]);

  // Opened straight from its link, the page shows the totals too.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Totals");
  await expect(monthRow(page, maria.slice(0, 4), month).getByRole("cell")).toHaveText(["$325.00", "$325.00", "$325.00"]);
});

test("with no Inquiry dated yet, Totals say so, and how many are waiting on a date", async ({ page, context }) => {
  await inquiryArrives({ name: "Undated Customer" });
  await inquiryArrives({ name: "Another Undated Customer" });
  await signIn(page, context, "push-token");
  await totalsLink(page).click();

  await expect(
    page.getByText("Totals show once an Inquiry has an event date. 2 Inquiries have no event date, so they're left out of these totals."),
  ).toBeVisible();
  await expect(page.getByRole("region")).toHaveCount(0);
});

test("Totals don't scroll sideways, and meet WCAG AA", async ({ page, context }) => {
  const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await inquiriesWithMoney();
  await local
    .store("inquiries")
    .setJSON("f", inquiry("f", "Big Customer", { eventDate: "2026-09-12", agreedPrice: 12_345_678_90, downPayment: 1_234_567_89 }));
  await signIn(page, context, "push-token");
  await totalsLink(page).click();
  await expect(year(page, "2026")).toBeVisible();

  expect(await overflow()).toBeLessThanOrEqual(0);
  expect((await axe()).violations).toEqual([]);
});
