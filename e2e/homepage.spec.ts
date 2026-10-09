import { devices } from "@playwright/test";
import { test, expect } from "../playwright-fixture";
import { mockSupabase } from "./support/supabaseMock";

const mockEvents = mockSupabase;

const expectedColumns: Record<string, number> = {
  "phone-portrait": 1,
  "phone-landscape": 2,
  tablet: 2,
  desktop: 3,
};

test("homepage (ro): hero, next 3 events, community, footer", async ({ page }, testInfo) => {
  await mockEvents(page);
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tango argentinian");
  await expect(page.getByRole("heading", { name: "Următoarele evenimente" })).toBeVisible();
  await expect(page.getByText("Milonga de toamnă")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Despre noi" })).toBeVisible();
  await expect(page.getByText("Comunitatea de tango din Oradea este un loc")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ce spun dansatorii din Oradea" })).toBeVisible();
  await expect(page.locator("#testimonials figure")).toHaveCount(3);
  // order: events → about us → testimonials → contact
  const order = await page.evaluate(() =>
    ["events", "community", "testimonials", "contact"].map((id) => document.getElementById(id)?.offsetTop ?? -1),
  );
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(order.every((y) => y >= 0)).toBe(true);

  const grid = page.locator("#events").getByTestId("event-grid");
  const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(columns).toBe(expectedColumns[testInfo.project.name]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  await page.screenshot({ path: `e2e/screenshots/home-ro-${testInfo.project.name}.png`, fullPage: true });
});

test("homepage (en) has its own URL, lang and hreflang links", async ({ page }, testInfo) => {
  await mockEvents(page);
  await page.goto("/en");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Upcoming events" })).toBeVisible();
  await expect(page.getByText("Autumn milonga")).toBeVisible();
  // Missing English title falls back to Romanian
  await expect(page.getByText("Practică ghidată")).toBeVisible();
  await expect(page.getByRole("link", { name: /Autumn milonga/ })).toHaveAttribute("href", "/en/events/milonga-de-toamna");
  await expect(page.locator('link[rel="alternate"][hreflang="hu"]')).toHaveAttribute("href", "https://oradeatango.ro/hu");
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", "https://oradeatango.ro/");

  if (testInfo.project.name === "phone-portrait") {
    await page.screenshot({ path: `e2e/screenshots/home-en-${testInfo.project.name}.png`, fullPage: true });
  }
});

test("language selector changes the URL and remembers the choice", async ({ page }) => {
  await mockEvents(page);
  await page.goto("/");
  await page.getByRole("link", { name: "HU" }).click();

  await expect(page).toHaveURL(/\/hu$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "hu");
  await expect(page.getByRole("heading", { name: "Következő események" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("lang"))).toBe("hu");

  await page.getByRole("link", { name: "RO" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Următoarele evenimente" })).toBeVisible();
});

test("a saved language choice is applied on the next visit", async ({ page }) => {
  await mockEvents(page);
  await page.addInitScript(() => localStorage.setItem("lang", "es"));
  await page.goto("/");
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.getByRole("heading", { name: "Próximos eventos" })).toBeVisible();
});

test("homepage still works when Supabase is unreachable", async ({ page }) => {
  await mockEvents(page, "fail");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Despre noi" })).toBeVisible();
  // supabase-js retries 3 times (1 s + 2 s + 4 s) before the section gives up
  await expect(page.locator("#events")).toHaveCount(0, { timeout: 15_000 });
});

test("the old /event address redirects to /events on Netlify", async () => {
  const fs = await import("node:fs");
  const lines = fs.readFileSync("public/_redirects", "utf8").trim().split(/\r?\n/);
  // must come before the SPA catch-all, or it would never match
  expect(lines.indexOf("/event /events 301")).toBeGreaterThanOrEqual(0);
  expect(lines.indexOf("/event /events 301")).toBeLessThan(lines.indexOf("/* /index.html 200"));
});

test("'See the events' opens the events page", async ({ page }) => {
  await mockEvents(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Vezi evenimentele" }).click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole("heading", { level: 1, name: "Evenimente" })).toBeVisible();
});

test("unknown pages show the 404 page in the right language", async ({ page }) => {
  await page.goto("/en/does-not-exist");
  await expect(page.getByText("Page not found")).toBeVisible();
  await page.goto("/xx");
  await expect(page.getByText("Pagina nu a fost găsită")).toBeVisible();
});

// A real phone (not a headless crawler) with an English browser: the first visit
// is redirected to /en, and the selector must still work by tapping afterwards.
const { defaultBrowserType: _ignored, ...pixel } = devices["Pixel 7"];

test.describe("on a real phone with an English browser", () => {
  test.use({ ...pixel, locale: "en-US" });

  test("first visit opens /en, then tapping the flags switches language", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone-portrait", "phone profile only");
    await mockEvents(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    // the whole page is in English, not only the parts rendered after the switch
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Argentine tango");
    await expect(page.getByRole("link", { name: "See the events" })).toBeVisible();

    await page.getByRole("link", { name: "HU", exact: true }).tap();
    await expect(page).toHaveURL(/\/hu$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Argentin tangó");

    await page.getByRole("link", { name: "RO", exact: true }).tap();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tango argentinian");
    // and it stays there (no bounce back to the detected language)
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  });
});
