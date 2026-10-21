import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { expect, test } from "@playwright/test";

// The build is the content gate: an invalid content entry must fail it, so broken content never goes live.
// Each bad case is one file in invalid-content/<collection>/. To add a case, drop a file there.

const repoRoot = join(import.meta.dirname, "../..");
const casesDir = join(import.meta.dirname, "invalid-content");
const workDir = join(import.meta.dirname, ".tmp");
const astroCli = join(repoRoot, "node_modules/astro/bin/astro.mjs");

test.describe.configure({ mode: "serial", timeout: 120_000 });

/** Builds a throwaway site that uses the real content schemas and holds only the given content entry. */
function buildWithOnly(collection: string, entryPath: string) {
  const root = join(workDir, `${collection}-${basename(entryPath)}`);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, "src/content", collection), { recursive: true });
  cpSync(entryPath, join(root, "src/content", collection, basename(entryPath)));
  const realConfig = relative(join(root, "src"), join(repoRoot, "src/content.config.ts")).replaceAll("\\", "/");
  writeFileSync(join(root, "src/content.config.ts"), `export { collections } from "${realConfig}";\n`);

  const result = spawnSync(process.execPath, [astroCli, "build", "--root", root], { cwd: repoRoot, encoding: "utf8" });
  return { exitCode: result.status, output: `${result.stdout}\n${result.stderr}` };
}

test("a valid Setup builds", () => {
  const { exitCode, output } = buildWithOnly("setups", join(repoRoot, "src/content/setups/sample-sage-and-ivory-baby-shower.json"));

  expect(exitCode, output).toBe(0);
});

test("a Setup whose Event type isn't on the Event types list builds, since the site shows it under Other", () => {
  const { exitCode, output } = buildWithOnly("setups", join(import.meta.dirname, "unlisted-event-type.json"));

  expect(exitCode, output).toBe(0);
});

test("a valid Package builds", () => {
  const { exitCode, output } = buildWithOnly("packages", join(repoRoot, "src/content/packages/sample-classic.json"));

  expect(exitCode, output).toBe(0);
});

test("a valid Rental builds", () => {
  const { exitCode, output } = buildWithOnly("rentals", join(repoRoot, "src/content/rentals/sample-round-backdrop-stand.json"));

  expect(exitCode, output).toBe(0);
});

for (const collection of readdirSync(casesDir)) {
  for (const name of readdirSync(join(casesDir, collection))) {
    test(`the build fails on an invalid ${collection} entry: ${name}`, () => {
      const { exitCode, output } = buildWithOnly(collection, join(casesDir, collection, name));

      expect(exitCode, output).not.toBe(0);
      expect(output).toContain(name.replace(/\.\w+$/, ""));
    });
  }
}
