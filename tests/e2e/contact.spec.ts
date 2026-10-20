import { expect, test, type Page } from "@playwright/test";
import { eventTypes } from "../../src/event-types";

// Each required field, a valid answer, and the message a visitor sees when it is left empty.
const requiredFields = [
  { label: "Your name", answer: "Maria Santos", message: "Please enter your name." },
  {
    label: "Phone number or email",
    answer: "maria@example.com",
    message: "Please enter a phone number or email so we can reply.",
  },
  { label: "Event date", answer: "2027-05-15", message: "Please choose the date of your event." },
  { label: "Venue or city", answer: "Markham", message: "Please enter the venue or city." },
  { label: "Event type", answer: "Baby shower", message: "Please choose an Event type.", chosenFromList: true },
];

async function fillIn(page: Page, fields: typeof requiredFields) {
  for (const { label, answer, chosenFromList } of fields) {
    const field = page.getByLabel(label);
    if (chosenFromList) {
      await field.selectOption(answer);
    } else {
      await field.fill(answer);
    }
  }
}

/** Records every form post, so a test can tell whether the Inquiry was actually sent. */
function watchPosts(page: Page) {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  return posts;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/contact/");
});

test("the Inquiry form is marked for Netlify Forms, with a honeypot field", async ({ page }) => {
  const form = page.getByRole("form", { name: "Inquiry" });

  await expect(form).toHaveAttribute("data-netlify", "true");
  await expect(form).toHaveAttribute("name", "inquiry");
  await expect(form).toHaveAttribute("method", /post/i);
  await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
  // The honeypot is in the page for bots to fill, but hidden from visitors and screen readers.
  await expect(form.locator('input[name="bot-field"]')).toBeAttached();
  await expect(form.locator('input[name="bot-field"]')).toBeHidden();
});

test("the Event type options are the shared Event type list", async ({ page }) => {
  const eventType = page.getByLabel("Event type");
  // The first option is the prompt to choose one, so leaving it there counts as missing.
  const options = eventType.locator("option:not([value=''])");

  await expect(options).toHaveText([...eventTypes]);
  await expect(eventType).toHaveValue("");
});

for (const missing of requiredFields) {
  test(`an Inquiry without "${missing.label}" is not sent, and says what is missing`, async ({ page }) => {
    const posts = watchPosts(page);
    await fillIn(
      page,
      requiredFields.filter((field) => field !== missing),
    );

    await page.getByRole("button", { name: "Send inquiry" }).click();

    const field = page.getByLabel(missing.label);
    await expect(field).toBeFocused();
    expect(await field.evaluate((element: HTMLInputElement) => element.validationMessage)).toBe(missing.message);
    expect(posts).toEqual([]);
    await expect(page).toHaveURL("/contact/");
  });
}

test("an empty Inquiry is not sent", async ({ page }) => {
  const posts = watchPosts(page);

  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page.getByLabel("Your name")).toBeFocused();
  expect(posts).toEqual([]);
});

test("a complete Inquiry is sent to Netlify and lands on a thank-you page", async ({ page }) => {
  // Netlify answers a form post by serving the page in the form's action. The preview server can't
  // take posts, so stand in for Netlify: record what was sent and serve that page.
  let sent: URLSearchParams | undefined;
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (request.method() !== "POST") return route.fallback();
    sent = new URLSearchParams(request.postData() ?? "");
    return route.fulfill({ response: await route.fetch({ method: "GET", postData: undefined }) });
  });
  await fillIn(page, requiredFields);

  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page).toHaveURL("/contact/thanks/");
  await expect(page).toHaveTitle("Thank you · Likha Events");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Thank you");
  await expect(page.getByRole("main")).toContainText(/reply within \d+ days?/);
  expect(sent?.get("form-name")).toBe("inquiry");
  expect(sent?.get("name")).toBe("Maria Santos");
  expect(sent?.get("event-type")).toBe("Baby shower");
});

test("visitors who prefer chatting can message Likha Events on Instagram or Facebook instead", async ({ page }) => {
  const main = page.getByRole("main");

  await expect(main.getByRole("link", { name: /Instagram/ })).toHaveAttribute(
    "href",
    "https://www.instagram.com/likha.events",
  );
  await expect(main.getByRole("link", { name: /Facebook/ })).toHaveAttribute(
    "href",
    "https://www.facebook.com/p/LIKHA-Events-61581441256098/",
  );
});
