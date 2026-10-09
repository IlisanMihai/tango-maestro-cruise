import { devices } from "@playwright/test";
import { test, expect, type Page } from "../playwright-fixture";

const DAY = 24 * 60 * 60 * 1000;
const at = (days: number, hourUtc: number) => {
  const d = new Date(Date.now() + days * DAY);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toISOString();
};

// Fake Supabase answers so the screenshots always show three cards.
const events = [
  {
    slug: "milonga-de-toamna",
    type: "milonga",
    start_at: at(3, 18),
    end_at: at(3, 23),
    title: { ro: "Milonga de toamnă", en: "Autumn milonga" },
    summary: { ro: "O seară caldă de tango, cu muzică de epocă de aur și invitați din toată țara.", en: "A warm tango evening with golden-age music and guests from all over the country." },
    location: "Feeling Dance Studio, Oradea",
  },
  {
    slug: "festival-oradea-tango",
    type: "festival",
    start_at: at(12, 9),
    end_at: at(14, 20),
    title: { ro: "Festivalul de tango Oradea", en: "Oradea tango festival" },
    summary: { ro: "Trei zile de workshop-uri, milongi și concerte live.", en: "Three days of workshops, milongas and live concerts." },
    location: "Oradea",
  },
  {
    slug: "practica-de-joi",
    type: "practica",
    start_at: at(20, 17),
    end_at: at(20, 19),
    title: { ro: "Practică ghidată" },
    summary: null,
    location: "Latino Vibes Studio, Oradea",
  },
].map((e, i) => ({
  id: `00000000-0000-4000-a000-00000000000${i}`,
  content: null,
  image_path: null,
  external_url: null,
  status: "published",
  created_by: null,
  created_at: "",
  updated_at: "",
  ...e,
}));

async function mockEvents(page: Page, mode: "ok" | "fail" = "ok") {
  await page.route("**/rest/v1/events**", (route) =>
    mode === "ok"
      ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(events) })
      : route.abort(),
  );
}

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

  const grid = page.locator("#events .grid");
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

test("/event (Carolina Jador page) is still available until /events exists", async ({ page }) => {
  await page.goto("/event");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Carolina Jador");
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
