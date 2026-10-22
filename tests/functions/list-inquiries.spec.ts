import { expect, test } from "@playwright/test";
import { listInquiries } from "../../netlify/functions/inquiries";
import type { Inquiry } from "../../netlify/inquiries";
import { gitHubStub } from "./github";
import { startLocalStore, type LocalStore } from "./local-store";

// The function the dashboard calls to list Inquiries, with GitHub's answer substituted.

let local: LocalStore;

test.beforeEach(async () => {
  local = await startLocalStore();
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

const list = (headers: Record<string, string>) => {
  const handler = listInquiries(() => local.inquiries(), gitHubStub);
  return handler(new Request("http://localhost/api/inquiries", { headers }));
};

test("lists the Inquiries for a user who can push to the repo", async () => {
  await local.store("inquiries").setJSON(maria.id, maria);

  const response = await list({ Authorization: "Bearer push-token" });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([maria]);
});

test("refuses without access, and shows no Inquiries", async () => {
  await local.store("inquiries").setJSON(maria.id, maria);
  const withoutAccess: Record<string, string>[] = [
    {},
    { Authorization: "Bearer read-token" },
    { Authorization: "Bearer made-up-token" },
  ];

  for (const headers of withoutAccess) {
    const response = await list(headers);

    expect(response.ok, JSON.stringify(headers)).toBe(false);
    expect(await response.text()).not.toContain(maria.name);
  }
});
