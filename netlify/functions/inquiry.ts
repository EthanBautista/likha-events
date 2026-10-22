import type { Config } from "@netlify/functions";
import { askGitHub, withAccess } from "../access";
import { Refused, netlifyInquiries, type InquiryChanges } from "../inquiries";

// PATCH /api/inquiries/:id: changes one Inquiry, such as its Inquiry status or notes, and sends it back
// as it now is. The Inquiries module decides which changes it takes. Tests build it with their own
// store and GitHub.

export const changeInquiry = (inquiries = netlifyInquiries, github = askGitHub) =>
  withAccess(async (request) => {
    const id = decodeURIComponent(new URL(request.url).pathname.split("/").pop() ?? "");
    // As the dashboard sent them: the Inquiries module checks each one.
    let changes: InquiryChanges;
    try {
      changes = await request.json();
    } catch {
      return Response.json({ message: "Send the changes as JSON." }, { status: 400 });
    }

    try {
      const changed = id ? await inquiries().change(id, changes) : undefined;
      if (!changed) return Response.json({ message: "This Inquiry isn't here any more." }, { status: 404 });
      return Response.json(changed);
    } catch (error) {
      if (error instanceof Refused) return Response.json({ message: error.message }, { status: 400 });
      throw error;
    }
  }, github);

export default changeInquiry();

export const config: Config = { path: "/api/inquiries/:id", method: "PATCH" };
