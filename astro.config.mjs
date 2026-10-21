// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://likhaevents.ca",
  // Each page loads as the visitor hovers or taps towards its link, so moving between pages is near instant.
  prefetch: { prefetchAll: true },
});
