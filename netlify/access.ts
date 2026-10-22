import { siteRepo } from "../src/site-settings";

// Who may see Inquiries (ADR 0004): only someone who can push to the site's repo, the same GitHub
// login the owner uses for the editor. The dashboard sends its GitHub token with every request, and
// every function asks this module before doing anything else.

/** What GitHub says about a token's user and the site's repo. */
export type GitHubAnswer = "can push" | "cannot push" | "unknown token";

/** Asks GitHub about a token. Tests substitute their own answer. */
export type AskGitHub = (token: string) => Promise<GitHubAnswer>;

/** Asks GitHub's API for the token's permissions on the site's repo. */
export const askGitHub: AskGitHub = async (token) => {
  const response = await fetch(`https://api.github.com/repos/${siteRepo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "likha-events-inquiry-dashboard",
    },
  });
  if (response.status === 401) return "unknown token";
  // GitHub hides a private repo from users who can't see it.
  if (response.status === 404) return "cannot push";
  // Anything else, such as a 403 for a rate limit, says nothing about the user, so the owner isn't
  // signed out over it: the function fails and the dashboard asks them to try again.
  if (!response.ok) throw new Error(`GitHub answered ${response.status} when asked about ${siteRepo}`);

  const repo: { permissions?: { push?: boolean } } = await response.json();
  return repo.permissions?.push ? "can push" : "cannot push";
};

/**
 * Why this request may not see Inquiries, as the response to send back, or undefined if it may.
 * 401 means sign in again; 403 means this GitHub account can't push to the repo.
 */
export async function accessRefusal(request: Request, github: AskGitHub = askGitHub): Promise<Response | undefined> {
  const token = request.headers.get("Authorization")?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return refusal(401, "Sign in with GitHub to see Inquiries.");

  const answer = await github(token);
  if (answer === "can push") return undefined;
  if (answer === "unknown token") return refusal(401, "GitHub doesn't recognise this sign-in. Sign in again.");
  return refusal(403, "This GitHub account can't make changes to the site, so it can't see Inquiries.");
}

/** Wraps a function's work so it only runs for a request that may see Inquiries. */
export function withAccess(work: (request: Request) => Promise<Response>, github: AskGitHub = askGitHub) {
  return async (request: Request): Promise<Response> => (await accessRefusal(request, github)) ?? work(request);
}

function refusal(status: 401 | 403, message: string): Response {
  return Response.json({ message }, { status });
}
