import type { AskGitHub } from "../../netlify/access";

// GitHub's answer, substituted in tests: "push-token" stands for a user who can push to the site's
// repo, "read-token" for one who can only read it, and any other token is one GitHub doesn't know.
export const gitHubStub: AskGitHub = async (token) =>
  ({ "push-token": "can push", "read-token": "cannot push" } as const)[token] ?? "unknown token";
