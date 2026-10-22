import type { Config } from "@netlify/functions";
import { askGitHub, withAccess } from "../access";
import { netlifyInquiries } from "../inquiries";

// DELETE /api/inquiries/:id: deletes one Inquiry and its inspiration photos, such as spam that slipped
// through or a duplicate. Tests build it with their own store and GitHub.

export const deleteInquiry = (inquiries = netlifyInquiries, github = askGitHub) =>
  withAccess(async (request) => {
    const id = decodeURIComponent(new URL(request.url).pathname.split("/").pop() ?? "");
    const deleted = id ? await inquiries().delete(id) : false;
    if (!deleted) return Response.json({ message: "This Inquiry isn't here any more." }, { status: 404 });
    return new Response(null, { status: 204 });
  }, github);

export default deleteInquiry();

export const config: Config = { path: "/api/inquiries/:id", method: "DELETE" };
