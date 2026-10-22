import type { Config } from "@netlify/functions";
import { askGitHub, withAccess } from "../access";
import { Refused, netlifyInquiries } from "../inquiries";

// POST /api/inquiries/:id/photos: attaches one inspiration photo, sent as a form with one file in
// `photo`, to an Inquiry added by hand, and sends the Inquiry back. Each photo comes on its own, so a
// few phone screenshots never make one request bigger than Netlify takes. Tests build it with their own
// store and GitHub.

export const addInquiryPhoto = (inquiries = netlifyInquiries, github = askGitHub) =>
  withAccess(async (request) => {
    const id = decodeURIComponent(new URL(request.url).pathname.split("/").at(-2) ?? "");
    let photo: FormDataEntryValue | null;
    try {
      photo = (await request.formData()).get("photo");
    } catch {
      photo = null;
    }
    if (!(photo instanceof File)) return Response.json({ message: "Send the photo as a file." }, { status: 400 });

    try {
      const changed = id ? await inquiries().addPhoto(id, { name: photo.name, type: photo.type, body: await photo.arrayBuffer() }) : undefined;
      if (!changed) return Response.json({ message: "This Inquiry isn't here any more." }, { status: 404 });
      return Response.json(changed, { status: 201 });
    } catch (error) {
      if (error instanceof Refused) return Response.json({ message: error.message }, { status: 400 });
      throw error;
    }
  }, github);

export default addInquiryPhoto();

export const config: Config = { path: "/api/inquiries/:id/photos", method: "POST" };
