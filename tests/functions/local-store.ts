import { getStore } from "@netlify/blobs";
import { BlobsServer } from "@netlify/blobs/server";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { inquiriesIn, type FetchFile, type Inquiries } from "../../netlify/inquiries";

// A Netlify Blobs store served from a temporary folder, standing in for the site's store in tests.
// Each one starts empty.

export interface LocalStore {
  /** A store by name, as `getStore` returns it on Netlify. */
  store: (name: string) => ReturnType<typeof getStore>;
  /** The Inquiries module on this store, fetching Netlify's file links with `fetchFile`. */
  inquiries: (fetchFile?: FetchFile) => Inquiries;
  stop: () => Promise<void>;
}

export async function startLocalStore(): Promise<LocalStore> {
  const directory = await mkdtemp(path.join(tmpdir(), "likha-blobs-"));
  const token = "local-store-token";
  const server = new BlobsServer({ directory, token });
  const { port } = await server.start();

  const store: LocalStore["store"] = (name) => getStore({ name, siteID: "local-site", token, apiURL: `http://localhost:${port}` });

  return {
    store,
    inquiries: (fetchFile) => inquiriesIn(store("inquiries"), store("inquiry-photos"), fetchFile),
    stop: async () => {
      await server.stop();
      await rm(directory, { recursive: true, force: true });
    },
  };
}
