import type { Config } from "@netlify/functions";
import { askGitHub, withAccess } from "../access";
import { netlifyInquiries } from "../inquiries";

// GET /api/inquiry-photos/:id: one of an Inquiry's inspiration photos, never served as a public URL.
// Tests build it with their own store and GitHub.

export const inquiryPhoto = (inquiries = netlifyInquiries, github = askGitHub) =>
  withAccess(async (request) => {
    const id = decodeURIComponent(new URL(request.url).pathname.split("/").pop() ?? "");
    const photo = id ? await inquiries().photo(id) : undefined;
    if (!photo) return Response.json({ message: "This photo isn't here." }, { status: 404 });

    return new Response(photo.body, {
      headers: {
        // A photo saved without an image type is sent as plain bytes, so a browser never runs it as a page.
        "Content-Type": photo.type || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        // A photo never changes, but it's kept only in this browser, as it's a customer's.
        "Cache-Control": "private, max-age=86400",
      },
    });
  }, github);

export default inquiryPhoto();

export const config: Config = { path: "/api/inquiry-photos/:id", method: "GET" };
