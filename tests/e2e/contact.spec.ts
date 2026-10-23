import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import { eventTypesForForms } from "./event-types";

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

/**
 * Netlify answers a form post by serving the page in the form's action. The preview server can't
 * take posts, so stand in for Netlify: keep what was sent and serve that page.
 */
async function standInForNetlify(page: Page) {
  const sent: { form?: FormData } = {};
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (request.method() !== "POST") return route.fallback();
    const posted = new Request(request.url(), {
      method: "POST",
      headers: { "content-type": (await request.headerValue("content-type")) ?? "" },
      body: new Uint8Array(request.postDataBuffer() ?? []),
    });
    sent.form = await posted.formData();
    return route.fulfill({ response: await route.fetch({ method: "GET", postData: undefined }) });
  });
  return sent;
}

const photo = (name: string) => ({ name, mimeType: "image/jpeg", buffer: Buffer.from(`photo ${name}`) });

/**
 * A real photo as big as a phone camera's: 6000 by 4000 pixels of noise, which shrinks poorly, so the JPEG
 * is about 11 MB, more than Netlify takes in one post. Made once and shared by the tests that need it.
 */
let bigPhotoBytes: Promise<Buffer> | undefined;
const bigPhoto = async (name: string) => {
  bigPhotoBytes ??= sharp({
    create: {
      width: 6000,
      height: 4000,
      channels: 3,
      background: "black",
      noise: { type: "gaussian", mean: 128, sigma: 30 },
    },
  })
    .jpeg({ quality: 85 })
    .toBuffer();
  return { name, mimeType: "image/jpeg", buffer: await bigPhotoBytes };
};

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

test("the Event type options are every Event type, alphabetically, with Other last", async ({ page }) => {
  const eventType = page.getByLabel("Event type");
  // The first option is the prompt to choose one, so leaving it there counts as missing.
  const options = eventType.locator("option:not([value=''])");

  await expect(options).toHaveText(eventTypesForForms());
  await expect(eventType).toHaveValue("");
});

test("a link with ?type=wedding opens the form with Wedding chosen", async ({ page }) => {
  await page.goto("/contact/?type=wedding");

  await expect(page.getByLabel("Event type")).toHaveValue("Wedding");
});

test("a link with an unknown type leaves the Event type to choose", async ({ page }) => {
  await page.goto("/contact/?type=garden-party");

  await expect(page.getByLabel("Event type")).toHaveValue("");
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
    // The message is shown under the field, and read out with it.
    await expect(page.getByRole("main").getByText(missing.message)).toBeVisible();
    await expect(field).toHaveAccessibleDescription(missing.message);
    await expect(field).toHaveAttribute("aria-invalid", "true");
    expect(posts).toEqual([]);
    await expect(page).toHaveURL("/contact/");
  });
}

test("filling in the whole form raises no errors in the page", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  await fillIn(page, requiredFields);
  await page.getByLabel("Number of guests").fill("40");
  await page.getByLabel("Theme or colours").fill("Sage and cream");
  await page.getByLabel("Décor wanted").fill("Balloon arch and a backdrop");

  expect(errors).toEqual([]);
});

test("a missing field's message goes once it is answered", async ({ page }) => {
  await page.getByRole("button", { name: "Send inquiry" }).click();
  const name = page.getByLabel("Your name");
  const message = page.getByRole("main").getByText("Please enter your name.");
  await expect(message).toBeVisible();

  await name.fill("Maria Santos");

  await expect(message).toBeHidden();
  await expect(name).not.toHaveAttribute("aria-invalid", "true");
  // The other missing fields still say what they need.
  await expect(page.getByRole("main").getByText("Please enter the venue or city.")).toBeVisible();
});

test("an empty Inquiry is not sent", async ({ page }) => {
  const posts = watchPosts(page);

  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page.getByLabel("Your name")).toBeFocused();
  expect(posts).toEqual([]);
});

test("a complete Inquiry is sent to Netlify and lands on a thank-you page", async ({ page }) => {
  const sent = await standInForNetlify(page);
  await fillIn(page, requiredFields);

  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page).toHaveURL("/contact/thanks/");
  await expect(page).toHaveTitle("Thank you · Likha Events");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Thank you");
  await expect(page.getByRole("main")).toContainText(/reply within \d+ days?/);
  expect(sent.form?.get("form-name")).toBe("inquiry");
  expect(sent.form?.get("name")).toBe("Maria Santos");
  expect(sent.form?.get("event-type")).toBe("Baby shower");
});

test("while an Inquiry is sending, the button says so and a second press sends nothing more", async ({ page }) => {
  // Keep the browser on the form, as it stays while a slow post on mobile data is still on its way: each
  // send the page lets go is counted, then held back before it leaves.
  await page.evaluate(() => {
    window.sends = 0;
    addEventListener("submit", (event) => {
      if (!event.defaultPrevented) window.sends++;
      event.preventDefault();
    });
  });
  await fillIn(page, requiredFields);

  await page.getByRole("button", { name: "Send inquiry" }).click();

  const sending = page.getByRole("button", { name: "Sending your inquiry…" });
  await expect(sending).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("status")).toHaveText("Sending your inquiry…");
  // It reads as unavailable, but a visitor can still tap it.
  await sending.click({ force: true });
  expect(await page.evaluate(() => window.sends)).toBe(1);
});

declare global {
  interface Window {
    sends: number;
  }
}

test("the optional details are labelled, and an Inquiry without them is still sent", async ({ page }) => {
  const sent = await standInForNetlify(page);
  for (const label of ["Number of guests", "Theme or colours", "Décor wanted", "Inspiration photos"]) {
    await expect(page.getByLabel(label)).toBeEmpty();
  }
  await fillIn(page, requiredFields);

  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page).toHaveURL("/contact/thanks/");
  expect(sent.form?.get("guests")).toBe("");
  expect(sent.form?.get("theme")).toBe("");
  expect(sent.form?.get("decor")).toBe("");
  expect(sent.form?.has("inspiration-photo-1")).toBe(false);
});

test("the optional details and each inspiration photo are sent with the Inquiry", async ({ page }) => {
  const sent = await standInForNetlify(page);
  await fillIn(page, requiredFields);
  await page.getByLabel("Number of guests").fill("40");
  await page.getByLabel("Theme or colours").fill("Sage and cream");
  await page.getByLabel("Décor wanted").fill("Balloon arch and a backdrop");
  await page.getByLabel("Inspiration photos").setInputFiles([photo("arch.jpg"), photo("table.jpg"), photo("cake.jpg")]);

  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page).toHaveURL("/contact/thanks/");
  expect(sent.form?.get("guests")).toBe("40");
  expect(sent.form?.get("theme")).toBe("Sage and cream");
  expect(sent.form?.get("decor")).toBe("Balloon arch and a backdrop");
  // Netlify Forms takes one file per field, so each photo goes in a field of its own.
  const photos = ["inspiration-photo-1", "inspiration-photo-2", "inspiration-photo-3"].map(
    (field) => sent.form?.getAll(field) as File[],
  );
  expect(photos.map((files) => files.map((file) => file.name))).toEqual([["arch.jpg"], ["table.jpg"], ["cake.jpg"]]);
  expect(await photos[0][0].text()).toBe("photo arch.jpg");
});

test("a big photo is shrunk to at most 2000 pixels wide before it is sent", async ({ page }) => {
  const sent = await standInForNetlify(page);
  const original = await bigPhoto("IMG_2041.JPG");
  await page.getByLabel("Inspiration photos").setInputFiles(original);
  await fillIn(page, requiredFields);

  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page).toHaveURL("/contact/thanks/");
  const posted = sent.form?.get("inspiration-photo-1") as File;
  expect(posted.name).toBe("IMG_2041.jpg");
  const bytes = Buffer.from(await posted.arrayBuffer());
  const { width, height, format } = await sharp(bytes).metadata();
  expect(format).toBe("jpeg");
  expect(width).toBe(2000);
  // Its shape is kept: 6000 by 4000 is 3 to 2.
  expect(Math.abs(height! - 1333)).toBeLessThanOrEqual(1);
  expect(bytes.length).toBeLessThan(original.buffer.length / 4);
});

test("pressing Send while a big photo is still shrinking sends the shrunk photo once it's ready", async ({ page }) => {
  const sent = await standInForNetlify(page);
  await fillIn(page, requiredFields);
  const original = await bigPhoto("IMG_2041.JPG");
  // Hold the shrinking back a moment, as on a slow phone, so Send is surely pressed before it's done.
  await page.evaluate(() => {
    const open = window.createImageBitmap;
    window.createImageBitmap = (async (...args: Parameters<typeof open>) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      return open(...args);
    }) as typeof open;
  });

  await page.getByLabel("Inspiration photos").setInputFiles(original);
  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page).toHaveURL("/contact/thanks/");
  const posted = sent.form?.get("inspiration-photo-1") as File;
  expect(posted.name).toBe("IMG_2041.jpg");
  expect((await sharp(Buffer.from(await posted.arrayBuffer())).metadata()).width).toBe(2000);
});

test("an Inquiry whose photos are still too large for Netlify is not sent, and says why", async ({ page }) => {
  const posts = watchPosts(page);
  await fillIn(page, requiredFields);
  const photos = page.getByLabel("Inspiration photos");
  // Photos the browser can't open, such as HEIC outside Safari, can't be shrunk, and 3 MB each is 9 MB in all.
  const unopenable = (name: string) => ({ name, mimeType: "image/heic", buffer: Buffer.alloc(3_000_000) });

  await photos.setInputFiles([unopenable("1.heic"), unopenable("2.heic"), unopenable("3.heic")]);
  await page.getByRole("button", { name: "Send inquiry" }).click();

  const message = "These photos are too large to send together. Please choose fewer or smaller photos.";
  await expect(page.getByRole("main")).toContainText(message);
  await expect(photos).toBeFocused();
  await expect(photos).toHaveAccessibleDescription(/too large to send/);
  expect(await photos.evaluate((element: HTMLInputElement) => element.validationMessage)).toBe(message);
  expect(posts).toEqual([]);
  await expect(page).toHaveURL("/contact/");
});

test("the photo picker offers images only", async ({ page }) => {
  await expect(page.getByLabel("Inspiration photos")).toHaveAttribute("accept", "image/*");
});

test("an Inquiry with a 4th photo is not sent, and says only 3 are allowed", async ({ page }) => {
  const posts = watchPosts(page);
  await fillIn(page, requiredFields);
  const photos = page.getByLabel("Inspiration photos");

  await photos.setInputFiles([photo("1.jpg"), photo("2.jpg"), photo("3.jpg"), photo("4.jpg")]);

  const message = "Please choose up to 3 photos. You chose 4.";
  await expect(page.getByRole("main")).toContainText(message);
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(photos).toBeFocused();
  expect(await photos.evaluate((element: HTMLInputElement) => element.validationMessage)).toBe(message);
  expect(posts).toEqual([]);

  // Choosing 3 instead clears the message.
  await photos.setInputFiles([photo("1.jpg"), photo("2.jpg"), photo("3.jpg")]);
  await expect(page.getByRole("main")).not.toContainText(message);
  expect(await photos.evaluate((element: HTMLInputElement) => element.validity.valid)).toBe(true);
});

test("an Inquiry with a file that isn't an image is not sent, and says why", async ({ page }) => {
  const posts = watchPosts(page);
  await fillIn(page, requiredFields);
  const photos = page.getByLabel("Inspiration photos");

  await photos.setInputFiles([
    photo("arch.jpg"),
    { name: "quote.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") },
  ]);

  const message = `"quote.pdf" isn't an image. Please choose photos only.`;
  await expect(page.getByRole("main")).toContainText(message);
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(photos).toBeFocused();
  expect(await photos.evaluate((element: HTMLInputElement) => element.validationMessage)).toBe(message);
  expect(posts).toEqual([]);
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
