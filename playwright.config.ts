import { defineConfig } from "@playwright/test";

// Uses the locally installed Microsoft Edge (no browser download needed on Windows).
// Override with PLAYWRIGHT_CHANNEL=chrome, or "" for Playwright's own Chromium.
const channel = process.env.PLAYWRIGHT_CHANNEL ?? "msedge";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  reporter: "list",
  use: {
    baseURL: "http://localhost:8080",
    channel: channel || undefined,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "phone-portrait", use: { viewport: { width: 375, height: 667 }, hasTouch: true } },
    { name: "phone-landscape", use: { viewport: { width: 667, height: 375 }, hasTouch: true } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  ],
});
