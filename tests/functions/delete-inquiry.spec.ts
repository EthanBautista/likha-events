import { expect, test } from "@playwright/test";
import { deleteInquiry } from "../../netlify/functions/delete-inquiry";
import type { Inquiry } from "../../netlify/inquiries";
import { gitHubStub } from "./github";
import { startLocalStore, type LocalStore } from "./local-store";

// The function the dashboard calls to delete an Inquiry, with GitHub's answer substituted.

let local: LocalStore;

test.beforeEach(async () => {
  local = await startLocalStore();
  await local.store("inquiries").setJSON(maria.id, maria);
});

test.afterEach(async () => {
  await local.stop();
});

const maria: Inquiry = {
  id: "inquiry-1",
  status: "New",
  source: "Contact form",
  receivedAt: "2026-10-01T14:30:00.000Z",
  name: "Maria Santos",
  contact: "maria@example.com",
  photos: [],
};

const remove = (id: string, headers: Record<string, string> = { Authorization: "Bearer push-token" }) => {
  const handler = deleteInquiry(() => local.inquiries(), gitHubStub);
  return handler(new Request(`http://localhost/api/inquiries/${id}`, { method: "DELETE", headers }));
};

test("deletes an Inquiry for a user who can push to the repo", async () => {
  const response = await remove(maria.id);

  expect(response.status).toBe(204);
  expect(await local.inquiries().list()).toEqual([]);
});

test("says an Inquiry that isn't there isn't found", async () => {
  const response = await remove("no-such-inquiry");

  expect(response.status).toBe(404);
  expect(await local.inquiries().list()).toEqual([maria]);
});

test("refuses without access, and deletes nothing", async () => {
  const withoutAccess: Record<string, string>[] = [
    {},
    { Authorization: "Bearer read-token" },
    { Authorization: "Bearer made-up-token" },
  ];

  for (const headers of withoutAccess) {
    const response = await remove(maria.id, headers);

    expect(response.ok, JSON.stringify(headers)).toBe(false);
  }
  expect(await local.inquiries().list()).toEqual([maria]);
});
