import { expect, test } from "@playwright/test";
import type { FormSubmission, Inquiry } from "../../netlify/inquiries";
import { startLocalStore, type LocalStore } from "./local-store";

// The Inquiries module, against a local Blobs store.

let local: LocalStore;

test.beforeEach(async () => {
  local = await startLocalStore();
});

test.afterEach(async () => {
  await local.stop();
});

const stored = (inquiry: Partial<Inquiry> & Pick<Inquiry, "id" | "name">): Inquiry => ({
  status: "New",
  source: "Contact form",
  receivedAt: "2026-10-01T14:30:00.000Z",
  contact: "maria@example.com",
  photos: [],
  ...inquiry,
});

const maria = stored({ id: "inquiry-1", name: "Maria Santos" });
const joy = stored({ id: "inquiry-2", name: "Joy Reyes", status: "Quoted" });

/** An Inquiry as Netlify hands it to the submission-created function. */
const submission = (data: Record<string, unknown>): FormSubmission => ({
  id: "5f1a2b3c4d5e6f7a8b9c0d1e",
  form_name: "inquiry",
  created_at: "2026-10-21T18:04:09.511Z",
  data: {
    name: "Maria Santos",
    contact: "416-555-0134",
    "event-date": "2026-11-14",
    venue: "Mississauga",
    "event-type": "Baby shower",
    guests: "40",
    theme: "Sage and gold",
    decor: "A balloon arch and a backdrop with her name",
    ...data,
  },
});

test("with nothing stored, there are no Inquiries", async () => {
  expect(await local.inquiries().list()).toEqual([]);
});

test("lists every stored Inquiry", async () => {
  const store = local.store("inquiries");
  await store.setJSON(maria.id, maria);
  await store.setJSON(joy.id, joy);

  const listed = await local.inquiries().list();

  expect(listed).toHaveLength(2);
  expect(listed).toEqual(expect.arrayContaining([maria, joy]));
});

test("an Inquiry from the contact form arrives as New, with everything the customer sent", async () => {
  const inquiries = local.inquiries();

  await inquiries.receive(submission({}));

  expect(await inquiries.list()).toEqual([
    {
      id: "5f1a2b3c4d5e6f7a8b9c0d1e",
      status: "New",
      source: "Contact form",
      receivedAt: "2026-10-21T18:04:09.511Z",
      name: "Maria Santos",
      contact: "416-555-0134",
      eventDate: "2026-11-14",
      venue: "Mississauga",
      eventType: "Baby shower",
      guests: "40",
      theme: "Sage and gold",
      decor: "A balloon arch and a backdrop with her name",
      photos: [],
    },
  ]);
});

/** Netlify's link to an uploaded file, as a submission carries it. */
const upload = (filename: string, type = "image/jpeg") => ({
  filename,
  type,
  size: 1024,
  url: `https://netlify-forms.example/uploads/${filename}?X-Amz-Expires=3600`,
});

/** Serves each uploaded file's name as its bytes, or fails for the names given. */
const netlifyFiles =
  (failing: string[] = []) =>
  async (url: string) => {
    const filename = new URL(url).pathname.split("/").pop()!;
    if (failing.includes(filename)) return new Response("Gone", { status: 403 });
    return new Response(`photo bytes of ${filename}`, { headers: { "Content-Type": "image/jpeg" } });
  };

test("each inspiration photo is copied into the store, and served from there", async () => {
  const inquiries = local.inquiries(netlifyFiles());

  await inquiries.receive(
    submission({ "inspiration-photo-1": upload("arch.jpg"), "inspiration-photo-2": upload("cake.png", "image/png") }),
  );

  const [{ photos }] = await inquiries.list();
  expect(photos.map((photo) => photo.name)).toEqual(["arch.jpg", "cake.png"]);
  const [arch, cake] = await Promise.all(photos.map((photo) => ("id" in photo ? inquiries.photo(photo.id) : undefined)));
  expect(new TextDecoder().decode(arch!.body)).toBe("photo bytes of arch.jpg");
  expect(arch!.type).toBe("image/jpeg");
  expect(new TextDecoder().decode(cake!.body)).toBe("photo bytes of cake.png");
  expect(cake!.type).toBe("image/png");
});

test("an Inquiry is still saved when a photo can't be copied, and shows which photo is missing", async () => {
  const unreachable = async (url: string) => {
    if (url.includes("cake.png")) throw new TypeError("fetch failed");
    return netlifyFiles(["arch.jpg"])(url);
  };
  const inquiries = local.inquiries(unreachable);

  await inquiries.receive(
    submission({
      "inspiration-photo-1": upload("arch.jpg"),
      "inspiration-photo-2": upload("cake.png"),
      "inspiration-photo-3": upload("table.jpg"),
    }),
  );

  const [{ name, photos }] = await inquiries.list();
  expect(name).toBe("Maria Santos");
  expect(photos).toEqual([
    { name: "arch.jpg", missing: true },
    { name: "cake.png", missing: true },
    { name: "table.jpg", id: expect.any(String) },
  ]);
});

test("lists upcoming events soonest first, then past events most recent first, then Inquiries with no date", async () => {
  const store = local.store("inquiries");
  const inquiries = [
    stored({ id: "past-september", name: "Past September", eventDate: "2026-09-01" }),
    stored({ id: "undated-older", name: "Undated older", receivedAt: "2026-10-02T10:00:00.000Z" }),
    stored({ id: "december", name: "December", eventDate: "2026-12-05" }),
    stored({ id: "today", name: "Today", eventDate: "2026-10-21" }),
    stored({ id: "undated-newer", name: "Undated newer", receivedAt: "2026-10-20T10:00:00.000Z" }),
    stored({ id: "past-october", name: "Past October", eventDate: "2026-10-03" }),
    stored({ id: "november", name: "November", eventDate: "2026-11-14" }),
  ];
  for (const inquiry of inquiries) await store.setJSON(inquiry.id, inquiry);

  const listed = await local.inquiries().list("2026-10-21");

  expect(listed.map(({ name }) => name)).toEqual([
    "Today",
    "November",
    "December",
    "Past October",
    "Past September",
    "Undated newer",
    "Undated older",
  ]);
});

test("a photo sent as just Netlify's link is copied too, named after its file", async () => {
  const inquiries = local.inquiries(netlifyFiles());

  await inquiries.receive(submission({ "inspiration-photo-1": "https://netlify-forms.example/uploads/arch.jpg?X-Amz-Expires=3600" }));

  const [{ photos }] = await inquiries.list();
  expect(photos).toEqual([{ name: "arch.jpg", id: expect.any(String) }]);
  const arch = await inquiries.photo("id" in photos[0] ? photos[0].id : "");
  expect(new TextDecoder().decode(arch!.body)).toBe("photo bytes of arch.jpg");
  expect(arch!.type).toBe("image/jpeg");
});
