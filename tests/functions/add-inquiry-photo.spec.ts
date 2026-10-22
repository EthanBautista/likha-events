import { expect, test } from "@playwright/test";
import { addInquiryPhoto } from "../../netlify/functions/add-inquiry-photo";
import type { Inquiry } from "../../netlify/inquiries";
import { gitHubStub } from "./github";
import { startLocalStore, type LocalStore } from "./local-store";

// The function the dashboard calls to attach a photo to an Inquiry added by hand, with GitHub's answer
// substituted. The dashboard sends each photo on its own, as a form with one file.

let local: LocalStore;
let joy: Inquiry;

test.beforeEach(async () => {
  local = await startLocalStore();
  joy = await local.inquiries().add({ source: "Instagram", name: "Joy Reyes", contact: "@joyreyes" });
});

test.afterEach(async () => {
  await local.stop();
});

const photoForm = (name: string, type: string) => {
  const form = new FormData();
  form.set("photo", new File([`screenshot bytes of ${name}`], name, { type }));
  return form;
};

const attach = (id: string, body: FormData | string, headers: Record<string, string> = { Authorization: "Bearer push-token" }) => {
  const handler = addInquiryPhoto(() => local.inquiries(), gitHubStub);
  return handler(new Request(`http://localhost/api/inquiries/${id}/photos`, { method: "POST", headers, body }));
};

test("attaches a photo for a user who can push to the repo, and sends the Inquiry back", async () => {
  const response = await attach(joy.id, photoForm("chat.png", "image/png"));

  expect(response.status).toBe(201);
  const changed: Inquiry = await response.json();
  expect(changed.photos).toEqual([{ name: "chat.png", id: expect.any(String) }]);
  const photo = await local.inquiries().photo("id" in changed.photos[0] ? changed.photos[0].id : "");
  expect(new TextDecoder().decode(photo!.body)).toBe("screenshot bytes of chat.png");
  expect(photo!.type).toBe("image/png");
});

test("refuses a photo it can't attach, saying why", async () => {
  for (const body of [photoForm("page.html", "text/html"), new FormData(), "not a form"]) {
    const response = await attach(joy.id, body);

    expect(response.status).toBe(400);
    expect((await response.json()).message).toEqual(expect.any(String));
  }
  expect((await local.inquiries().list())[0].photos).toEqual([]);
});

test("says an Inquiry that isn't there isn't found", async () => {
  const response = await attach("no-such-inquiry", photoForm("chat.png", "image/png"));

  expect(response.status).toBe(404);
});

test("refuses without access, and attaches nothing", async () => {
  const withoutAccess: Record<string, string>[] = [{}, { Authorization: "Bearer read-token" }, { Authorization: "Bearer made-up-token" }];

  for (const headers of withoutAccess) {
    const response = await attach(joy.id, photoForm("chat.png", "image/png"), headers);

    expect(response.ok, JSON.stringify(headers)).toBe(false);
  }
  expect((await local.inquiries().list())[0].photos).toEqual([]);
});
