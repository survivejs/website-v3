import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  use: { baseURL: "http://127.0.0.1:3010" },
  webServer: {
    command: "node scripts/serve-static.mjs build --port 3010",
    url: "http://127.0.0.1:3010",
    reuseExistingServer: !process.env.CI,
  },
});
