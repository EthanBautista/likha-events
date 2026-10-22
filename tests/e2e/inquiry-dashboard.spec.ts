import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { listInquiries } from "../../netlify/functions/inquiries";
import { inquiriesIn } from "../../netlify/inquiries";
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
  const list = listInquiries(() => inquiriesIn(local.store("inquiries")), gitHubStub);
  await context.route("**/api/inquiries", async (route) => {
    const response = await list(new Request(route.request().url(), { headers: route.request().headers() }));
    await route.fulfill({ status: response.status, contentType: "application/json", body: await response.text() });
  });
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
