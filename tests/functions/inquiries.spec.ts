import { expect, test } from "@playwright/test";
import { Refused, costsTotal, owed, totals, type FormSubmission, type Inquiry, type InquiryChanges, type NewInquiry } from "../../netlify/inquiries";
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

test("an Inquiry can be set to any Inquiry status from any other, and nothing else about it changes", async () => {
  const store = local.store("inquiries");
  const inquiries = local.inquiries();
  const moves: [Inquiry["status"], Inquiry["status"]][] = [
    ["New", "Booked"],
    ["Booked", "Quoted"],
    ["Quoted", "Done"],
    ["Done", "New"],
    ["New", "Declined"],
    ["Declined", "Booked"],
  ];

  for (const [from, to] of moves) {
    await store.setJSON(maria.id, { ...maria, status: from });

    const changed = await inquiries.change(maria.id, { status: to });

    expect(changed).toEqual({ ...maria, status: to });
    expect(await inquiries.list()).toEqual([{ ...maria, status: to }]);
  }
});

test("notes are saved on an Inquiry, can be rewritten, and cleared", async () => {
  await local.store("inquiries").setJSON(maria.id, maria);
  const inquiries = local.inquiries();

  await inquiries.change(maria.id, { notes: "Wants gold balloons.\nCall after 6pm." });
  expect(await inquiries.list()).toEqual([{ ...maria, notes: "Wants gold balloons.\nCall after 6pm." }]);

  await inquiries.change(maria.id, { notes: "Quoted $650 by text." });
  expect(await inquiries.list()).toEqual([{ ...maria, notes: "Quoted $650 by text." }]);

  await inquiries.change(maria.id, { notes: "  " });
  expect(await inquiries.list()).toEqual([maria]);
});

test("changing an Inquiry that isn't there changes nothing", async () => {
  const inquiries = local.inquiries();

  expect(await inquiries.change("no-such-inquiry", { status: "Booked" })).toBeUndefined();
  expect(await inquiries.list()).toEqual([]);
});

test("a contact-form Inquiry's customer answers can't be changed, and a refused change changes nothing", async () => {
  const inquiries = local.inquiries();
  await inquiries.receive(submission({}));
  const [received] = await inquiries.list();
  const answers: InquiryChanges[] = [
    { name: "Mary Santos" },
    { contact: "mary@example.com" },
    { eventDate: "2026-12-01" },
    { venue: "Toronto" },
    { eventType: "Birthday" },
    { guests: "60" },
    { theme: "Pink" },
    { decor: "Just balloons" },
  ];

  for (const answer of answers) {
    await expect(inquiries.change(received.id, { status: "Quoted", notes: "Called her", ...answer }), JSON.stringify(answer)).rejects.toThrow(
      Refused,
    );
  }
  expect(await inquiries.list()).toEqual([received]);
});

test("a change that isn't one the owner can make is refused", async () => {
  await local.store("inquiries").setJSON(maria.id, maria);
  const inquiries = local.inquiries();
  const notChanges = [{ status: "Archived" }, { notes: 42 }, { receivedAt: "2020-01-01T00:00:00.000Z" }, { photos: [] }, null, "Booked"];

  for (const changes of notChanges) {
    await expect(inquiries.change(maria.id, changes as InquiryChanges), JSON.stringify(changes)).rejects.toThrow(Refused);
  }
  expect(await inquiries.list()).toEqual([maria]);
});

// Inquiries the owner adds by hand, from Instagram or Facebook messages.

test("an Inquiry can be added by hand with only a name and a way to reach them, and starts as New", async () => {
  const inquiries = local.inquiries();

  const added = await inquiries.add({ source: "Instagram", name: "Joy Reyes", contact: "@joyreyes" });

  expect(added).toEqual({
    id: expect.any(String),
    status: "New",
    source: "Instagram",
    receivedAt: expect.any(String),
    name: "Joy Reyes",
    contact: "@joyreyes",
    photos: [],
  });
  expect(Date.now() - Date.parse(added.receivedAt)).toBeLessThan(60_000);
  expect(await inquiries.list()).toEqual([added]);
});

test("an Inquiry added by hand keeps the details given, leaving out any left empty", async () => {
  const inquiries = local.inquiries();

  const added = await inquiries.add({
    source: "Facebook",
    name: " Joy Reyes ",
    contact: "facebook.com/joy.reyes",
    eventDate: "2026-12-05",
    venue: "Brampton",
    eventType: "Birthday",
    guests: "",
    theme: "  ",
    decor: "A pink balloon garland",
  });

  expect(added).toEqual({
    id: expect.any(String),
    status: "New",
    source: "Facebook",
    receivedAt: expect.any(String),
    name: "Joy Reyes",
    contact: "facebook.com/joy.reyes",
    eventDate: "2026-12-05",
    venue: "Brampton",
    eventType: "Birthday",
    decor: "A pink balloon garland",
    photos: [],
  });
});

test("an Inquiry added by hand needs a name, a way to reach them, and where it came from", async () => {
  const inquiries = local.inquiries();
  const notInquiries = [
    { source: "Instagram", name: "", contact: "@joyreyes" },
    { source: "Instagram", name: "Joy Reyes", contact: "  " },
    { source: "Instagram", name: "Joy Reyes" },
    { name: "Joy Reyes", contact: "@joyreyes" },
    { source: "Contact form", name: "Joy Reyes", contact: "@joyreyes" },
    { source: "TikTok", name: "Joy Reyes", contact: "@joyreyes" },
    { source: "Instagram", name: "Joy Reyes", contact: "@joyreyes", eventDate: "next Saturday" },
    { source: "Instagram", name: "Joy Reyes", contact: "@joyreyes", eventDate: "2026-13-45" },
    { source: "Instagram", name: "Joy Reyes", contact: "@joyreyes", eventDate: "2027-02-29" },
    { source: "Instagram", name: "Joy Reyes", contact: "@joyreyes", guests: "lots" },
    { source: "Instagram", name: "Joy Reyes", contact: "@joyreyes", guests: "0" },
    { source: "Instagram", name: "Joy Reyes", contact: "@joyreyes", guests: 40 },
    { source: "Instagram", name: "Joy Reyes", contact: "@joyreyes", status: "Booked" },
    { source: "Instagram", name: "Joy Reyes", contact: "@joyreyes", photos: [] },
    null,
  ];

  for (const details of notInquiries) {
    await expect(inquiries.add(details as NewInquiry), JSON.stringify(details)).rejects.toThrow(Refused);
  }
  expect(await inquiries.list()).toEqual([]);
});

test("an Inquiry added by hand can have its details filled in, changed and cleared later", async () => {
  const inquiries = local.inquiries();
  const added = await inquiries.add({ source: "Instagram", name: "Joy", contact: "@joyreyes" });

  await inquiries.change(added.id, { name: "Joy Reyes", eventDate: "2026-12-05", venue: "Brampton", guests: "60", notes: "Sent prices" });
  const changed = await inquiries.change(added.id, { contact: "416-555-0199", venue: "", eventType: "Birthday", source: "Facebook" });

  const expected = {
    ...added,
    source: "Facebook",
    name: "Joy Reyes",
    contact: "416-555-0199",
    eventDate: "2026-12-05",
    eventType: "Birthday",
    guests: "60",
    notes: "Sent prices",
  };
  expect(changed).toEqual(expected);
  expect(await inquiries.list()).toEqual([expected]);
});

test("an Inquiry added by hand keeps its name and a way to reach them, and comes from Instagram or Facebook", async () => {
  const inquiries = local.inquiries();
  const added = await inquiries.add({ source: "Instagram", name: "Joy Reyes", contact: "@joyreyes" });
  const notChanges = [{ name: " " }, { contact: "" }, { eventDate: "Dec 5" }, { eventDate: "2026-02-30" }, { guests: 60 }, { guests: "about 40" }, { source: "Contact form" }, { source: "TikTok" }];

  for (const changes of notChanges) {
    await expect(inquiries.change(added.id, changes as InquiryChanges), JSON.stringify(changes)).rejects.toThrow(Refused);
  }
  expect(await inquiries.list()).toEqual([added]);
});

test("a contact-form Inquiry's source can't be changed", async () => {
  await local.store("inquiries").setJSON(maria.id, maria);

  await expect(local.inquiries().change(maria.id, { source: "Instagram" })).rejects.toThrow(Refused);
  expect(await local.inquiries().list()).toEqual([maria]);
});

/** A screenshot the owner attaches, its bytes standing in for the image. */
const screenshot = (name: string, type = "image/png") => ({ name, type, body: new TextEncoder().encode(`screenshot bytes of ${name}`).buffer });

test("photos can be attached to an Inquiry added by hand, and are served from the store", async () => {
  const inquiries = local.inquiries();
  const added = await inquiries.add({ source: "Instagram", name: "Joy Reyes", contact: "@joyreyes" });

  await inquiries.addPhoto(added.id, screenshot("chat.png"));
  const withPhotos = await inquiries.addPhoto(added.id, screenshot("cake.jpg", "image/jpeg"));

  expect(withPhotos?.photos).toEqual([
    { name: "chat.png", id: expect.any(String) },
    { name: "cake.jpg", id: expect.any(String) },
  ]);
  const [{ photos }] = await inquiries.list();
  expect(photos).toEqual(withPhotos?.photos);
  const [chat, cake] = await Promise.all(photos.map((photo) => ("id" in photo ? inquiries.photo(photo.id) : undefined)));
  expect(new TextDecoder().decode(chat!.body)).toBe("screenshot bytes of chat.png");
  expect(chat!.type).toBe("image/png");
  expect(new TextDecoder().decode(cake!.body)).toBe("screenshot bytes of cake.jpg");
  expect(cake!.type).toBe("image/jpeg");
});

test("an Inquiry added by hand takes as many photos as the contact form, and only images", async () => {
  const inquiries = local.inquiries();
  const added = await inquiries.add({ source: "Facebook", name: "Joy Reyes", contact: "@joyreyes" });

  await expect(inquiries.addPhoto(added.id, screenshot("page.html", "text/html"))).rejects.toThrow(Refused);
  for (const name of ["1.png", "2.png", "3.png"]) await inquiries.addPhoto(added.id, screenshot(name));
  await expect(inquiries.addPhoto(added.id, screenshot("4.png"))).rejects.toThrow(Refused);

  const [{ photos }] = await inquiries.list();
  expect(photos.map(({ name }) => name)).toEqual(["1.png", "2.png", "3.png"]);
});

test("a contact-form Inquiry keeps the photos the customer sent, and a photo for an Inquiry that isn't there is not saved", async () => {
  await local.store("inquiries").setJSON(maria.id, maria);
  const inquiries = local.inquiries();

  await expect(inquiries.addPhoto(maria.id, screenshot("chat.png"))).rejects.toThrow(Refused);
  expect(await inquiries.addPhoto("no-such-inquiry", screenshot("chat.png"))).toBeUndefined();
  expect(await inquiries.list()).toEqual([maria]);
  expect((await local.store("inquiry-photos").list()).blobs).toEqual([]);
});

test("deleting an Inquiry removes it and its photos, and leaves the others as they were", async () => {
  const inquiries = local.inquiries(netlifyFiles());
  await inquiries.receive(submission({ "inspiration-photo-1": upload("arch.jpg"), "inspiration-photo-2": upload("cake.png") }));
  const added = await inquiries.add({ source: "Instagram", name: "Joy Reyes", contact: "@joyreyes" });
  const withPhoto = await inquiries.addPhoto(added.id, screenshot("chat.png"));

  expect(await inquiries.delete("5f1a2b3c4d5e6f7a8b9c0d1e")).toBe(true);

  expect(await inquiries.list()).toEqual([withPhoto]);
  const [chat] = withPhoto!.photos;
  expect((await local.store("inquiry-photos").list()).blobs.map(({ key }) => key)).toEqual(["id" in chat ? chat.id : ""]);
});

// Money on an Inquiry, in CAD as whole cents.

test("the Agreed price, Down payment and Balance received are saved on an Inquiry, and can be changed and cleared", async () => {
  await local.store("inquiries").setJSON(maria.id, maria);
  const inquiries = local.inquiries();

  await inquiries.change(maria.id, { status: "Quoted", agreedPrice: 65_000 });
  await inquiries.change(maria.id, { status: "Booked", downPayment: 32_500 });
  expect(await inquiries.list()).toEqual([{ ...maria, status: "Booked", agreedPrice: 65_000, downPayment: 32_500 }]);

  const changed = await inquiries.change(maria.id, { agreedPrice: 70_050, balance: 37_550 });
  expect(changed).toEqual({ ...maria, status: "Booked", agreedPrice: 70_050, downPayment: 32_500, balance: 37_550 });

  await inquiries.change(maria.id, { agreedPrice: null, downPayment: 0, balance: null });
  expect(await inquiries.list()).toEqual([{ ...maria, status: "Booked", downPayment: 0 }]);
});

test("an amount is whole cents, not below zero, and a refused one changes nothing", async () => {
  await local.store("inquiries").setJSON(maria.id, { ...maria, agreedPrice: 65_000 });
  const inquiries = local.inquiries();
  const notAmounts = [{ agreedPrice: 650.5 }, { agreedPrice: "650" }, { downPayment: -100 }, { balance: Number.MAX_SAFE_INTEGER + 1 }, { balance: {} }];

  for (const changes of notAmounts) {
    await expect(inquiries.change(maria.id, { status: "Booked", ...changes } as InquiryChanges), JSON.stringify(changes)).rejects.toThrow(
      Refused,
    );
  }
  expect(await inquiries.list()).toEqual([{ ...maria, agreedPrice: 65_000 }]);
});

test("Costs are listed on an Inquiry, each with a description and an amount, and can be added and removed", async () => {
  await local.store("inquiries").setJSON(maria.id, maria);
  const inquiries = local.inquiries();
  const balloons = { description: "Balloons", amount: 8_450 };
  const sign = { description: "Printed sign", amount: 3_500 };

  await inquiries.change(maria.id, { costs: [balloons] });
  await inquiries.change(maria.id, { costs: [balloons, { description: " Printed sign ", amount: 3_500 }] });
  expect(await inquiries.list()).toEqual([{ ...maria, costs: [balloons, sign] }]);

  await inquiries.change(maria.id, { costs: [sign] });
  expect(await inquiries.list()).toEqual([{ ...maria, costs: [sign] }]);

  await inquiries.change(maria.id, { costs: [] });
  expect(await inquiries.list()).toEqual([maria]);
});

test("a Cost needs a description and an amount in whole cents, and refused Costs change nothing", async () => {
  const balloons = { description: "Balloons", amount: 8_450 };
  await local.store("inquiries").setJSON(maria.id, { ...maria, costs: [balloons] });
  const inquiries = local.inquiries();
  const notCosts = [
    { description: "  ", amount: 100 },
    { description: "Balloons" },
    { amount: 100 },
    { description: "Balloons", amount: 84.5 },
    { description: "Balloons", amount: -100 },
    { description: 42, amount: 100 },
    { description: "Balloons", amount: 100, paidBy: "card" },
    "Balloons",
    null,
  ];

  for (const cost of notCosts) {
    await expect(inquiries.change(maria.id, { costs: [balloons, cost] } as InquiryChanges), JSON.stringify(cost)).rejects.toThrow(Refused);
  }
  await expect(inquiries.change(maria.id, { costs: balloons } as unknown as InquiryChanges)).rejects.toThrow(Refused);
  expect(await inquiries.list()).toEqual([{ ...maria, costs: [balloons] }]);
});

test("Owed is the Agreed price less the Down payment and Balance received, counted only once Booked or Done", () => {
  const paidHalf = { ...maria, agreedPrice: 65_000, downPayment: 32_500 };
  const owedIn = (status: Inquiry["status"]) => owed({ ...paidHalf, status });

  expect(owedIn("New")).toBeUndefined();
  expect(owedIn("Quoted")).toBeUndefined();
  expect(owedIn("Booked")).toBe(32_500);
  expect(owedIn("Done")).toBe(32_500);
  expect(owedIn("Declined")).toBeUndefined();
});

test("Owed is nothing once paid in full, never below zero, and unknown with no Agreed price", () => {
  const booked = { ...maria, status: "Booked" as const };

  expect(owed({ ...booked, agreedPrice: 65_000, downPayment: 32_500, balance: 32_500 })).toBe(0);
  expect(owed({ ...booked, agreedPrice: 65_000, downPayment: 32_500, balance: 40_000 })).toBe(0);
  expect(owed({ ...booked, agreedPrice: 65_000 })).toBe(65_000);
  expect(owed({ ...booked, downPayment: 32_500 })).toBeUndefined();
});

test("an Inquiry's Costs add up to their total", () => {
  expect(costsTotal(maria)).toBe(0);
  expect(costsTotal({ ...maria, costs: [{ description: "Balloons", amount: 8_450 }, { description: "Printed sign", amount: 3_500 }] })).toBe(11_950);
});

// Earned, Owed and Profit on events, by the month and year of each event.

test("a month's Earned, Owed and Profit on events add up its Inquiries", () => {
  const paidHalf = stored({ id: "a", name: "Maria", status: "Booked", eventDate: "2026-11-14", agreedPrice: 65_000, downPayment: 32_500 });
  const paidInFull = stored({
    id: "b",
    name: "Joy",
    status: "Done",
    eventDate: "2026-11-02",
    agreedPrice: 40_000,
    downPayment: 20_000,
    balance: 20_000,
    costs: [{ description: "Balloons", amount: 8_450 }],
  });
  const quoted = stored({
    id: "c",
    name: "Ana",
    status: "Quoted",
    eventDate: "2026-11-28",
    agreedPrice: 90_000,
    costs: [{ description: "Sample centrepiece", amount: 1_500 }],
  });

  expect(totals([paidHalf, paidInFull, quoted]).years[0].months).toEqual([
    { month: "2026-11", earned: 72_500, owed: 32_500, profitOnEvents: 62_550 },
  ]);
});

test("a Declined Inquiry's Down payment still counts as Earned, though nothing is Owed on it", () => {
  const declined = stored({
    id: "a",
    name: "Maria",
    status: "Declined",
    eventDate: "2026-12-05",
    agreedPrice: 65_000,
    downPayment: 15_000,
    costs: [{ description: "Fabric", amount: 4_000 }],
  });

  expect(totals([declined]).years).toEqual([
    { year: "2026", earned: 15_000, owed: 0, profitOnEvents: 11_000, months: [{ month: "2026-12", earned: 15_000, owed: 0, profitOnEvents: 11_000 }] },
  ]);
});

test("an Inquiry with no event date is left out of the totals, and counted as undated", () => {
  const booked = stored({ id: "a", name: "Maria", status: "Booked", eventDate: "2026-11-14", agreedPrice: 65_000, downPayment: 32_500 });
  const undated = stored({ id: "b", name: "Joy", status: "Booked", agreedPrice: 40_000, downPayment: 20_000 });
  const undatedNew = stored({ id: "c", name: "Ana" });

  const { years, undated: leftOut } = totals([booked, undated, undatedNew]);

  expect(years).toEqual([
    { year: "2026", earned: 32_500, owed: 32_500, profitOnEvents: 32_500, months: [{ month: "2026-11", earned: 32_500, owed: 32_500, profitOnEvents: 32_500 }] },
  ]);
  expect(leftOut).toBe(2);
  expect(totals([booked]).undated).toBe(0);
});

test("a year's totals add up its months, the most recent year first and its months in calendar order", () => {
  const march = stored({ id: "a", name: "Maria", status: "Done", eventDate: "2026-03-21", agreedPrice: 50_000, downPayment: 25_000, balance: 25_000 });
  const october = stored({
    id: "b",
    name: "Joy",
    status: "Booked",
    eventDate: "2026-10-10",
    agreedPrice: 80_000,
    downPayment: 40_000,
    costs: [{ description: "Flowers", amount: 12_000 }],
  });
  const lastYear = stored({ id: "c", name: "Ana", status: "Done", eventDate: "2025-12-31", agreedPrice: 30_000, downPayment: 30_000 });
  const nextYear = stored({ id: "d", name: "Rosa", status: "Quoted", eventDate: "2027-02-13", agreedPrice: 70_000 });

  expect(totals([october, lastYear, nextYear, march]).years).toEqual([
    { year: "2027", earned: 0, owed: 0, profitOnEvents: 0, months: [{ month: "2027-02", earned: 0, owed: 0, profitOnEvents: 0 }] },
    {
      year: "2026",
      earned: 90_000,
      owed: 40_000,
      profitOnEvents: 78_000,
      months: [
        { month: "2026-03", earned: 50_000, owed: 0, profitOnEvents: 50_000 },
        { month: "2026-10", earned: 40_000, owed: 40_000, profitOnEvents: 28_000 },
      ],
    },
    { year: "2025", earned: 30_000, owed: 0, profitOnEvents: 30_000, months: [{ month: "2025-12", earned: 30_000, owed: 0, profitOnEvents: 30_000 }] },
  ]);
});

test("deleting an Inquiry whose photo couldn't be saved removes it, and one that isn't there deletes nothing", async () => {
  await local.store("inquiries").setJSON(maria.id, { ...maria, photos: [{ name: "cake.png", missing: true }] });
  await local.store("inquiries").setJSON(joy.id, joy);
  const inquiries = local.inquiries();

  expect(await inquiries.delete("no-such-inquiry")).toBe(false);
  expect(await inquiries.delete(maria.id)).toBe(true);

  expect(await inquiries.list()).toEqual([joy]);
});
