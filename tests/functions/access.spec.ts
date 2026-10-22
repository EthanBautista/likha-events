import { expect, test } from "@playwright/test";
import { accessRefusal } from "../../netlify/access";
import { gitHubStub as github } from "./github";

// Only someone who can push to the site's repo may see Inquiries.

const requestWith = (headers: Record<string, string>) => new Request("http://localhost/api/inquiries", { headers });

test("a user who can push to the repo gets in", async () => {
  expect(await accessRefusal(requestWith({ Authorization: "Bearer push-token" }), github)).toBeUndefined();
});

test("a user who can only read the repo is refused", async () => {
  const refusal = await accessRefusal(requestWith({ Authorization: "Bearer read-token" }), github);

  expect(refusal?.status).toBe(403);
});

test("a token GitHub doesn't know is refused", async () => {
  const refusal = await accessRefusal(requestWith({ Authorization: "Bearer made-up-token" }), github);

  expect(refusal?.status).toBe(401);
});

test("a request without a token is refused, without asking GitHub", async () => {
  let asked = false;
  const refusal = await accessRefusal(requestWith({}), async () => {
    asked = true;
    return "can push";
  });

  expect(refusal?.status).toBe(401);
  expect(asked).toBe(false);
});

test("a malformed sign-in header is refused", async () => {
  for (const header of ["push-token", "Basic push-token", "Bearer ", "Bearer push-token extra"]) {
    const refusal = await accessRefusal(requestWith({ Authorization: header }), github);

    expect(refusal?.status, header).toBe(401);
  }
});
