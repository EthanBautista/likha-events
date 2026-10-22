import { expect, test } from "@playwright/test";
import { addInquiry } from "../../netlify/functions/add-inquiry";
import { gitHubStub } from "./github";
import { startLocalStore, type LocalStore } from "./local-store";

// The function the dashboard calls to add an Inquiry by hand, with GitHub's answer substituted.

let local: LocalStore;

test.beforeEach(async () => {
  local = await startLocalStore();
});

test.afterEach(async () => {
  await local.stop();
});

const add = (body: string, headers: Record<string, string> = { Authorization: "Bearer push-token" }) => {
  const handler = addInquiry(() => local.inquiries(), gitHubStub);
  return handler(new Request("http://localhost/api/inquiries", { method: "POST", headers, body }));
};

test("adds an Inquiry for a user who can push to the repo, and sends it back", async () => {
  const response = await add(JSON.stringify({ source: "Instagram", name: "Joy Reyes", contact: "@joyreyes" }));

  expect(response.status).toBe(201);
  const added = await response.json();
  expect(added).toMatchObject({ status: "New", source: "Instagram", name: "Joy Reyes", contact: "@joyreyes" });
  expect(await local.inquiries().list()).toEqual([added]);
});

test("refuses an Inquiry it can't add, saying why", async () => {
  for (const body of [JSON.stringify({ source: "Instagram", name: "Joy Reyes" }), "not json"]) {
    const response = await add(body);

    expect(response.status, body).toBe(400);
    expect((await response.json()).message, body).toEqual(expect.any(String));
  }
  expect(await local.inquiries().list()).toEqual([]);
});

test("refuses without access, and adds nothing", async () => {
  const withoutAccess: Record<string, string>[] = [{}, { Authorization: "Bearer read-token" }, { Authorization: "Bearer made-up-token" }];

  for (const headers of withoutAccess) {
    const response = await add(JSON.stringify({ source: "Instagram", name: "Joy Reyes", contact: "@joyreyes" }), headers);

    expect(response.ok, JSON.stringify(headers)).toBe(false);
  }
  expect(await local.inquiries().list()).toEqual([]);
});
