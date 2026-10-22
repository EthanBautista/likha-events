import type { Config } from "@netlify/functions";
import { askGitHub, withAccess } from "../access";
import { Refused, netlifyInquiries, type NewInquiry } from "../inquiries";

// POST /api/inquiries: adds an Inquiry the owner took from an Instagram or Facebook message, and sends
// it back. Its photos follow one at a time, to /api/inquiries/:id/photos. The Inquiries module decides
// what it takes. Tests build it with their own store and GitHub.

export const addInquiry = (inquiries = netlifyInquiries, github = askGitHub) =>
  withAccess(async (request) => {
    // As the dashboard sent it: the Inquiries module checks it.
    let details: NewInquiry;
    try {
      details = await request.json();
    } catch {
      return Response.json({ message: "Send the Inquiry as JSON." }, { status: 400 });
    }

    try {
      return Response.json(await inquiries().add(details), { status: 201 });
    } catch (error) {
      if (error instanceof Refused) return Response.json({ message: error.message }, { status: 400 });
      throw error;
    }
  }, github);

export default addInquiry();

export const config: Config = { path: "/api/inquiries", method: "POST" };
