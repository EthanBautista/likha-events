import { expect, test } from "@playwright/test";
import { inquiriesIn, type Inquiry } from "../../netlify/inquiries";
import { startLocalStore, type LocalStore } from "./local-store";

// The Inquiries module, against a local Blobs store.

let local: LocalStore;

test.beforeEach(async () => {
  local = await startLocalStore();
});

test.afterEach(async () => {
  await local.stop();
});

const maria: Inquiry = { id: "inquiry-1", name: "Maria Santos", status: "New", receivedAt: "2026-10-01T14:30:00.000Z" };
const joy: Inquiry = { id: "inquiry-2", name: "Joy Reyes", status: "Quoted", receivedAt: "2026-10-03T09:00:00.000Z" };

test("with nothing stored, there are no Inquiries", async () => {
  expect(await inquiriesIn(local.store("inquiries")).list()).toEqual([]);
});

test("lists every stored Inquiry", async () => {
  const store = local.store("inquiries");
  await store.setJSON(maria.id, maria);
  await store.setJSON(joy.id, joy);

  const listed = await inquiriesIn(store).list();

  expect(listed).toHaveLength(2);
  expect(listed).toEqual(expect.arrayContaining([maria, joy]));
});
