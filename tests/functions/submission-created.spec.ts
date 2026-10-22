import { expect, test } from "@playwright/test";
import { submissionCreated } from "../../netlify/functions/submission-created";
import { startLocalStore, type LocalStore } from "./local-store";

// The function Netlify runs for each form submission that passes its spam filter.

let local: LocalStore;

test.beforeEach(async () => {
  local = await startLocalStore();
});

test.afterEach(async () => {
  await local.stop();
});

/** Netlify's request to the function, carrying the submission as its payload. */
const netlifySends = (payload: Record<string, unknown>) =>
  submissionCreated(() => local.inquiries())(
    new Request("http://localhost/.netlify/functions/submission-created", {
      method: "POST",
      body: JSON.stringify({ payload, site: { name: "likha-events" } }),
    }),
  );

test("an Inquiry sent through the contact form is saved as New", async () => {
  const response = await netlifySends({
    id: "5f1a2b3c4d5e6f7a8b9c0d1e",
    form_name: "inquiry",
    created_at: "2026-10-21T18:04:09.511Z",
    data: { name: "Maria Santos", contact: "maria@example.com", "event-date": "2026-11-14" },
  });

  expect(response.ok).toBe(true);
  expect(await local.inquiries().list()).toEqual([
    expect.objectContaining({ name: "Maria Santos", status: "New", source: "Contact form" }),
  ]);
});

test("a submission of another form is not an Inquiry", async () => {
  const response = await netlifySends({
    id: "6a1a2b3c4d5e6f7a8b9c0d1e",
    form_name: "newsletter",
    created_at: "2026-10-21T18:04:09.511Z",
    data: { name: "Maria Santos", email: "maria@example.com" },
  });

  expect(response.ok).toBe(true);
  expect(await local.inquiries().list()).toEqual([]);
});
