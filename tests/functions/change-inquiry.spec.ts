import { expect, test } from "@playwright/test";
import { changeInquiry } from "../../netlify/functions/inquiry";
import type { Inquiry } from "../../netlify/inquiries";
import { gitHubStub } from "./github";
import { startLocalStore, type LocalStore } from "./local-store";

// The function the dashboard calls to change an Inquiry, with GitHub's answer substituted.

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

const change = (id: string, body: string, headers: Record<string, string> = { Authorization: "Bearer push-token" }) => {
  const handler = changeInquiry(() => local.inquiries(), gitHubStub);
  return handler(new Request(`http://localhost/api/inquiries/${id}`, { method: "PATCH", headers, body }));
};

test("changes an Inquiry for a user who can push to the repo, and sends it back", async () => {
  const response = await change(maria.id, JSON.stringify({ status: "Quoted", notes: "Sent the Classic package" }));

  expect(response.status).toBe(200);
  const changed = { ...maria, status: "Quoted", notes: "Sent the Classic package" };
  expect(await response.json()).toEqual(changed);
  expect(await local.inquiries().list()).toEqual([changed]);
});

test("says an Inquiry that isn't there isn't found", async () => {
  const response = await change("no-such-inquiry", JSON.stringify({ status: "Quoted" }));

  expect(response.status).toBe(404);
});

test("refuses a change the Inquiry can't take, saying why", async () => {
  for (const body of [JSON.stringify({ name: "Mary Santos" }), JSON.stringify({ status: "Archived" }), "not json"]) {
    const response = await change(maria.id, body);

    expect(response.status, body).toBe(400);
    expect((await response.json()).message, body).toEqual(expect.any(String));
  }
  expect(await local.inquiries().list()).toEqual([maria]);
});

test("refuses without access, and changes nothing", async () => {
  const withoutAccess: Record<string, string>[] = [
    {},
    { Authorization: "Bearer read-token" },
    { Authorization: "Bearer made-up-token" },
  ];

  for (const headers of withoutAccess) {
    const response = await change(maria.id, JSON.stringify({ status: "Declined" }), headers);

    expect(response.ok, JSON.stringify(headers)).toBe(false);
    expect(await response.text()).not.toContain(maria.name);
  }
  expect(await local.inquiries().list()).toEqual([maria]);
});
