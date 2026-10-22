import type { Config } from "@netlify/functions";
import { askGitHub, withAccess } from "../access";
import { netlifyInquiries } from "../inquiries";

// GET /api/inquiries: every Inquiry, for the dashboard. Tests build it with their own store and GitHub.

export const listInquiries = (inquiries = netlifyInquiries, github = askGitHub) =>
  withAccess(async () => Response.json(await inquiries().list()), github);

export default listInquiries();

export const config: Config = { path: "/api/inquiries", method: "GET" };
