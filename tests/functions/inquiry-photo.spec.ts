import { expect, test } from "@playwright/test";
import { inquiryPhoto } from "../../netlify/functions/inquiry-photo";
import { gitHubStub } from "./github";
import { startLocalStore, type LocalStore } from "./local-store";

// The function the dashboard calls for an Inquiry's inspiration photo, with GitHub's answer substituted.

let local: LocalStore;

/** The id of the photo an Inquiry arrived with. */
let photoId: string;

test.beforeEach(async () => {
  local = await startLocalStore();
  const inquiries = local.inquiries(async () => new Response("photo bytes"));
  await inquiries.receive({
    id: "inquiry-1",
    form_name: "inquiry",
    created_at: "2026-10-21T18:04:09.511Z",
    data: {
      name: "Maria Santos",
      contact: "maria@example.com",
      "inspiration-photo-1": { filename: "arch.png", type: "image/png", url: "https://netlify-forms.example/arch.png" },
    },
  });
  const [{ photos }] = await inquiries.list();
  photoId = "id" in photos[0] ? photos[0].id : "";
});

test.afterEach(async () => {
  await local.stop();
});

const fetchPhoto = (id: string, headers: Record<string, string>) => {
  const handler = inquiryPhoto(() => local.inquiries(), gitHubStub);
  return handler(new Request(`http://localhost/api/inquiry-photos/${id}`, { headers }));
};

test("serves a photo to a user who can push to the repo", async () => {
  const response = await fetchPhoto(photoId, { Authorization: "Bearer push-token" });

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("image/png");
  expect(await response.text()).toBe("photo bytes");
});

test("says a photo that isn't there isn't found", async () => {
  const response = await fetchPhoto("no-such-photo", { Authorization: "Bearer push-token" });

  expect(response.status).toBe(404);
});

test("refuses without access, and sends no photo", async () => {
  const withoutAccess: Record<string, string>[] = [
    {},
    { Authorization: "Bearer read-token" },
    { Authorization: "Bearer made-up-token" },
  ];

  for (const headers of withoutAccess) {
    const response = await fetchPhoto(photoId, headers);

    expect(response.ok, JSON.stringify(headers)).toBe(false);
    expect(await response.text()).not.toContain("photo bytes");
  }
});
