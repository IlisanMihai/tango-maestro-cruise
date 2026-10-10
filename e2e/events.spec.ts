import { test, expect } from "../playwright-fixture";
import { mockSupabase } from "./support/supabaseMock";

const expectedColumns: Record<string, number> = {
  "phone-portrait": 1,
  "phone-landscape": 2,
  tablet: 2,
  desktop: 3,
};

const cardTitles = (page: import("@playwright/test").Page) => page.locator("main h3").allInnerTexts();

test("events page: active events by start date, responsive grid", async ({ page }, testInfo) => {
  await mockSupabase(page);
  await page.goto("/events");

  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page.getByRole("heading", { level: 1, name: "Evenimente" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Active" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Milonga de toamnă")).toBeVisible();
  expect(await cardTitles(page)).toEqual(["Milonga de toamnă", "Festivalul de tango Oradea", "Practică ghidată"]);

  const columns = await page
    .getByTestId("event-grid")
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(columns).toBe(expectedColumns[testInfo.project.name]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  await page.screenshot({ path: `e2e/screenshots/events-ro-${testInfo.project.name}.png`, fullPage: true });
});

test("type filters: alphabetical, 'Altul' last, several at once, 'Toate' clears", async ({ page }, testInfo) => {
  await mockSupabase(page);
  await page.goto("/events");

  const filters = page.getByRole("navigation", { name: "Tip de eveniment" }).getByRole("button");
  expect(await filters.allInnerTexts()).toEqual([
    "Toate",
    "Curs",
    "Encuentro",
    "Festival",
    "Maraton",
    "Milonga",
    "Practică",
    "Workshop",
    "Altul",
  ]);
  const chip = (name: string) => page.getByRole("button", { name, exact: true });
  await expect(chip("Toate")).toHaveAttribute("aria-pressed", "true");

  // the selected tab (underline) and chips (border) use the orange of the selected language
  const orange = await page
    .getByRole("link", { name: "RO", exact: true })
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await expect(chip("Toate")).toHaveCSS("border-top-color", orange);
  await expect(chip("Festival")).not.toHaveCSS("border-top-color", orange);
  // unselected chips use a lighter shade of the same orange, not gold
  const [r, g, b] = orange.match(/\d+/g)!.map(Number);
  await expect(chip("Festival")).toHaveCSS("border-top-color", `rgba(${r}, ${g}, ${b}, 0.3)`);
  await chip("Festival").hover();
  await expect(chip("Festival")).toHaveCSS("border-top-color", `rgba(${r}, ${g}, ${b}, 0.7)`);
  await expect(page.getByTestId("tab-indicator")).toHaveCSS("background-color", orange);

  await chip("Festival").click();
  await expect(page).toHaveURL(/\/events\?type=festival$/);
  await expect(chip("Toate")).toHaveAttribute("aria-pressed", "false");
  await expect(chip("Festival")).toHaveCSS("border-top-color", orange);
  await expect.poll(() => cardTitles(page)).toEqual(["Festivalul de tango Oradea"]);

  // a second type is added, not swapped
  await chip("Practică").click();
  await expect(page).toHaveURL(/\/events\?type=festival,practica$/);
  await expect(chip("Festival")).toHaveAttribute("aria-pressed", "true");
  await expect(chip("Practică")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => cardTitles(page)).toEqual(["Festivalul de tango Oradea", "Practică ghidată"]);

  if (testInfo.project.name === "phone-portrait") {
    await page.screenshot({ path: `e2e/screenshots/events-filters-${testInfo.project.name}.png` });
  }

  // tapping a selected chip removes it
  await chip("Festival").click();
  await expect(page).toHaveURL(/\/events\?type=practica$/);
  await expect.poll(() => cardTitles(page)).toEqual(["Practică ghidată"]);

  await chip("Maraton").click();
  await expect(page).toHaveURL(/type=maraton,practica$/);

  // "Toate" deselects everything
  await chip("Toate").click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(chip("Toate")).toHaveAttribute("aria-pressed", "true");
  await expect(chip("Practică")).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => cardTitles(page)).toHaveLength(3);

  // removing the last selected type also means "all"
  await chip("Milonga").click();
  await chip("Milonga").click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(chip("Toate")).toHaveAttribute("aria-pressed", "true");
});

test("an empty filter combination says so", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/events?type=maraton");
  await expect(page.getByText("Nu există evenimente de acest tip aici.")).toBeVisible();
});

test("past tab: newest first, 12 at a time, keeps the filter", async ({ page }, testInfo) => {
  await mockSupabase(page);
  await page.goto("/events?tab=past");

  await expect(page.getByRole("link", { name: "Trecute" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Milonga trecută 1", { exact: true })).toBeVisible();
  const titles = await cardTitles(page);
  expect(titles).toHaveLength(12);
  expect(titles[0]).toBe("Milonga trecută 1");
  expect(titles[11]).toBe("Milonga trecută 12");

  await page.getByRole("button", { name: "Încarcă mai multe" }).click();
  await expect(page.getByText("Milonga trecută 14", { exact: true })).toBeVisible();
  expect(await cardTitles(page)).toHaveLength(14);
  await expect(page.getByRole("button", { name: "Încarcă mai multe" })).toHaveCount(0);

  await page.getByRole("button", { name: "Workshop", exact: true }).click();
  await expect(page).toHaveURL(/tab=past&type=workshop$/);
  await expect(page.getByText("Milonga trecută 1", { exact: true })).toBeVisible();
  expect(await cardTitles(page)).toHaveLength(5);

  if (testInfo.project.name === "phone-portrait") {
    await page.screenshot({ path: `e2e/screenshots/events-past-${testInfo.project.name}.png`, fullPage: true });
  }
});

test("the orange underline slides to the selected tab", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/events");
  const indicator = page.getByTestId("tab-indicator");
  const under = async (name: string) => {
    const [line, tab] = await Promise.all([indicator.boundingBox(), page.getByRole("link", { name }).boundingBox()]);
    return Math.abs(line!.x - tab!.x) < 1 && Math.abs(line!.width - tab!.width) < 1;
  };

  await expect.poll(() => under("Active")).toBe(true);
  await expect(indicator).toHaveCSS("transition-duration", "0.3s");
  await page.getByRole("link", { name: "Trecute" }).click();
  await expect(page).toHaveURL(/tab=past$/);
  await expect.poll(() => under("Trecute")).toBe(true);
  await page.getByRole("link", { name: "Active" }).click();
  await expect.poll(() => under("Active")).toBe(true);
});

test("filters wrap onto several rows instead of scrolling sideways", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/events");
  const nav = page.getByRole("navigation", { name: "Tip de eveniment" });
  const viewport = page.viewportSize()!;
  for (const chip of await nav.getByRole("button").all()) {
    const box = (await chip.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  }
  expect(await nav.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test("on a phone the 9 filters sit 3 per row", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone-portrait", "phone portrait only");
  await mockSupabase(page);
  await page.goto("/events");
  const chips = page.getByRole("navigation", { name: "Tip de eveniment" }).getByRole("button");
  await expect(chips).toHaveCount(9);
  const rows = new Map<number, number>();
  for (const chip of await chips.all()) {
    const y = Math.round((await chip.boundingBox())!.y);
    rows.set(y, (rows.get(y) ?? 0) + 1);
  }
  expect([...rows.values()]).toEqual([3, 3, 3]);
});

test("tabs stay visible while scrolling", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/events?tab=past");
  await expect(page.getByText("Milonga trecută 12", { exact: true })).toBeVisible();
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(300);
  const box = await page.getByRole("link", { name: "Trecute" }).boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeLessThan(80);
});

test("event page shows everything about the event", async ({ page }, testInfo) => {
  await mockSupabase(page);
  await page.goto("/events");
  await page.getByRole("link", { name: /Milonga de toamnă/ }).click();

  await expect(page).toHaveURL(/\/events\/milonga-de-toamna$/);
  await expect(page.getByRole("heading", { level: 1, name: "Milonga de toamnă" })).toBeVisible();
  // the map link opens the exact point picked in the admin
  await expect(page.getByText("Feeling Dance Studio, Oradea")).toHaveAttribute(
    "href",
    "https://www.google.com/maps/search/?api=1&query=47.0599%2C21.9271",
  );
  await expect(page.getByText("O seară caldă de tango")).toBeVisible();
  await expect(page.getByText("Intrarea: 30 lei.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Mai multe informații/ })).toHaveAttribute(
    "href",
    "https://www.facebook.com/events/1",
  );
  await expect(page.getByRole("link", { name: /Google Calendar/ })).toHaveAttribute("href", /calendar\.google\.com/);
  await expect(page).toHaveTitle("Milonga de toamnă | Tango Oradea");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://oradeatango.ro/events/milonga-de-toamna",
  );

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `e2e/screenshots/event-detail-${testInfo.project.name}.png`, fullPage: true });

  await page.getByRole("link", { name: "Toate evenimentele" }).click();
  await expect(page).toHaveURL(/\/events$/);
});

test("a past event says it has ended and offers no calendar button", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/events/milonga-trecuta-3");
  await expect(page.getByRole("heading", { level: 1, name: "Milonga trecută 3" })).toBeVisible();
  await expect(page.getByText("Acest eveniment s-a încheiat.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Google Calendar/ })).toHaveCount(0);
});

test("event pages work in other languages", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/en/events/milonga-de-toamna");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1, name: "Autumn milonga" })).toBeVisible();
  await expect(page.getByRole("link", { name: "More information" })).toBeVisible();

  await page.getByRole("link", { name: "HU", exact: true }).click();
  await expect(page).toHaveURL(/\/hu\/events\/milonga-de-toamna$/);
  await expect(page.getByRole("link", { name: "Összes esemény" })).toBeVisible();
});

test("unknown event shows the 404 page", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/events/nu-exista");
  await expect(page.getByText("Pagina nu a fost găsită")).toBeVisible();
});

test("events page explains when events cannot be loaded", async ({ page }) => {
  await mockSupabase(page, "fail");
  await page.goto("/events");
  await expect(page.getByText("Evenimentele nu au putut fi încărcate.")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Încearcă din nou" })).toBeVisible();
});

test("on a phone an event card is at most half the screen, without the location", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone-portrait", "phone portrait only");
  await mockSupabase(page);
  await page.goto("/events");
  const card = page.getByRole("link", { name: /Milonga de toamnă/ });
  await expect(card).toBeVisible();
  const viewport = page.viewportSize()!;
  for (const c of await page.locator("main a[href*='/events/']").all()) {
    expect((await c.boundingBox())!.height).toBeLessThanOrEqual(viewport.height / 2);
  }
  // photo flush top-left on half the card, title to its right,
  // then date (left) and type (right) on one line, then the summary
  const [box, photo, title, date, type, summary] = await Promise.all([
    card.boundingBox(),
    card.locator("img").boundingBox(),
    card.locator("h3").boundingBox(),
    card.getByText(/octombrie/).boundingBox(),
    card.getByText("Milonga", { exact: true }).boundingBox(),
    card.locator("p.line-clamp-3").boundingBox(),
  ]);
  expect(Math.abs(photo!.x - box!.x)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(photo!.y - box!.y)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(photo!.width - box!.width / 2)).toBeLessThanOrEqual(2);
  expect(title!.x).toBeGreaterThanOrEqual(photo!.x + photo!.width - 1);
  expect(date!.y).toBeGreaterThanOrEqual(photo!.y + photo!.height - 1);
  expect(date!.x).toBeLessThan(box!.x + box!.width / 2);
  expect(type!.x + type!.width).toBeGreaterThan(box!.x + box!.width - 30);
  // same line: the type sits on the date's first line (a long date may wrap)
  expect(Math.abs(type!.y - date!.y)).toBeLessThan(8);
  expect(summary!.y).toBeGreaterThanOrEqual(date!.y + date!.height - 1);
  await expect(card.locator("p.line-clamp-3")).toHaveCSS("-webkit-line-clamp", "3");
  await expect(page.locator("main").getByText("Feeling Dance Studio, Oradea")).toHaveCount(0);
});

test("event page always shows a photo (default one when the event has none)", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/events/milonga-de-toamna");
  const img = page.getByRole("img", { name: "Milonga de toamnă" });
  await expect(img).toBeVisible();
  expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
});

test("the top bar hides when scrolling down and returns when scrolling up", async ({ page }) => {
  await mockSupabase(page);
  await page.goto("/events?tab=past");
  await expect(page.getByText("Milonga trecută 12", { exact: true })).toBeVisible();
  const languages = page.getByRole("navigation", { name: "Limba" });
  const top = async () => (await languages.boundingBox())!.y;
  expect(await top()).toBeGreaterThanOrEqual(0);

  const header = page.locator("header");
  await expect(header).toHaveCSS("transition-property", "all"); // slides and fades

  await page.mouse.wheel(0, 1200);
  // like the homepage selector: it lifts a little and fades out
  await expect(header).toHaveCSS("opacity", "0");
  await expect.poll(top).toBeLessThan(12);

  await page.mouse.wheel(0, -200);
  await expect.poll(top).toBeGreaterThanOrEqual(0);
  await expect(header).toHaveCSS("opacity", "1");
  // the tabs move below the bar instead of being covered by it
  const bar = (await header.boundingBox())!;
  await expect
    .poll(async () => (await page.getByRole("link", { name: "Trecute" }).boundingBox())!.y)
    .toBeGreaterThanOrEqual(bar.y + bar.height - 1);
});

test("on wider screens a card shows photo, title, date/type line, then the summary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "phone-portrait", "wider screens only");
  await mockSupabase(page);
  await page.goto("/events");
  const card = page.getByRole("link", { name: /Milonga de toamnă/ });
  await expect(card).toBeVisible();
  const [box, photo, title, date, type, summary] = await Promise.all([
    card.boundingBox(),
    card.locator("img").boundingBox(),
    card.locator("h3").boundingBox(),
    card.getByText(/octombrie/).boundingBox(),
    card.getByText("Milonga", { exact: true }).boundingBox(),
    card.locator("p.line-clamp-3").boundingBox(),
  ]);
  expect(Math.abs(photo!.width - box!.width)).toBeLessThanOrEqual(2);
  expect(title!.y).toBeGreaterThanOrEqual(photo!.y + photo!.height - 1);
  expect(date!.y).toBeGreaterThanOrEqual(title!.y + title!.height - 1);
  expect(type!.x).toBeGreaterThan(date!.x);
  expect(type!.x + type!.width).toBeGreaterThan(box!.x + box!.width - 30);
  expect(summary!.y).toBeGreaterThanOrEqual(date!.y + date!.height - 1);
});
