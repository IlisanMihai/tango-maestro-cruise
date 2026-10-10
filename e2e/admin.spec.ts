import { test, expect, type Page } from "../playwright-fixture";
import { EDITOR_ID, TEST_EMAIL, TEST_PASSWORD, mockSupabase } from "./support/supabaseMock";
import { pickDateTime } from "./support/adminHelpers";

async function login(page: Page, password = TEST_PASSWORD) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Parolă").fill(password);
  await page.getByRole("button", { name: "Intră în cont" }).click();
}

test("the admin area needs a login and is hidden from search engines", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Administrare" })).toBeVisible();
  // Google login stays hidden until VITE_GOOGLE_LOGIN=true
  await expect(page.getByRole("button", { name: "Continuă cu Google" })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

test("a wrong password shows a clear message", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page, "wrong-password");
  await expect(page.getByRole("alert")).toHaveText("Email sau parolă greșită.");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("an inactive account cannot use the admin", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor", active: false });
  await login(page);
  await expect(page.getByRole("heading", { name: "Cont inactiv" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Adaugă eveniment" })).toHaveCount(0);
});

test("logging in never flashes the 'inactive account' screen", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor", profileDelayMs: 800 });
  await page.addInitScript(() => {
    const seen = () => document.body?.innerText.includes("Cont inactiv");
    new MutationObserver(() => {
      if (seen()) (window as unknown as { inactiveSeen: boolean }).inactiveSeen = true;
    }).observe(document, { childList: true, subtree: true, characterData: true });
  });
  await login(page);
  await expect(page.getByRole("heading", { name: "Evenimentele mele" })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { inactiveSeen?: boolean }).inactiveSeen ?? false)).toBe(false);
});

test("an editor sees only their own events and cannot delete", async ({ page }, testInfo) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Evenimentele mele" })).toBeVisible();
  await expect(page.getByText("2 evenimente")).toBeVisible();

  // phones: cards; from 768 px (tablet, desktop): a table
  const list = testInfo.project.name.startsWith("phone")
    ? page.getByTestId("admin-event-cards")
    : page.locator("table");
  await expect(list).toBeVisible();
  await expect(list.getByText("Milonga de toamnă", { exact: true })).toBeVisible();
  await expect(list.getByText("Festivalul de tango Oradea", { exact: true })).toBeVisible();
  await expect(list.getByText("Practică ghidată", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Șterge/ })).toHaveCount(0);

  if (testInfo.project.name === "phone-portrait" || testInfo.project.name === "desktop") {
    await page.screenshot({ path: `e2e/screenshots/admin-list-${testInfo.project.name}.png`, fullPage: true });
  }
});

test("an admin sees every event, can search and delete after confirming", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "admin" });
  await login(page);
  await expect(page.getByRole("heading", { name: "Toate evenimentele" })).toBeVisible();
  await expect(page.getByText("17 evenimente")).toBeVisible();

  await page.getByRole("searchbox").fill("toamna"); // no diacritics needed
  await expect(page.getByRole("button", { name: "Șterge: Milonga de toamnă" }).locator("visible=true")).toHaveCount(1);

  await page.getByRole("button", { name: "Șterge: Milonga de toamnă" }).locator("visible=true").click();
  await expect(page.getByRole("alertdialog")).toContainText("Ștergi evenimentul?");
  await page.getByRole("button", { name: "Șterge", exact: true }).click();
  await expect(page.getByText("Evenimentul a fost șters.")).toBeVisible();
  expect(db.events.some((e) => e.slug === "milonga-de-toamna")).toBe(false);
});

test("adding an event: validation, auto address, photo, preview and save", async ({ page }, testInfo) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await expect(page.getByRole("heading", { name: "Eveniment nou" })).toBeVisible();

  // empty form -> errors
  await page.getByRole("button", { name: "Adaugă evenimentul" }).click();
  await expect(page.getByText("Titlul în română este obligatoriu.")).toBeVisible();
  await expect(page.getByText("Alege tipul evenimentului.")).toBeVisible();

  await page.getByLabel("Titlu (Română) *").fill("Milonga de iarnă în Oradea");
  await expect(page.getByLabel("Adresa în site *")).toHaveValue("milonga-de-iarna-in-oradea");
  await page.getByLabel("Descriere scurtă (Română)").fill("O seară caldă de tango în plină iarnă.");
  await page.getByRole("tab", { name: /English/ }).click();
  await page.getByLabel("Titlu (English)").fill("Winter milonga in Oradea");
  await expect(page.getByRole("tab", { name: "English: tradus" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Magyar: lipsește" })).toBeVisible();

  await page.getByLabel("Tip *").selectOption("milonga");
  await pickDateTime(page, "Început", "2026-12-05T21:00");
  await pickDateTime(page, "Sfârșit", "2026-12-06T02:00");
  await page.getByLabel("Numele locului și adresa").fill("Feeling Dance Studio, Oradea");

  await page.getByTestId("photo-input").setInputFiles("src/assets/hero-mobile.webp");
  await expect(page.getByText("Poza a fost încărcată.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Fără poză" })).toBeVisible();

  await page.getByRole("radio", { name: "Publicat" }).click();
  await expect(page.getByText("Evenimentul apare pe site imediat după salvare.")).toBeVisible();

  await page.getByRole("button", { name: "Previzualizare" }).click();
  await expect(page.getByRole("dialog")).toContainText("Milonga de iarnă în Oradea");
  if (testInfo.project.name === "phone-portrait") {
    await page.screenshot({ path: "e2e/screenshots/admin-preview-phone-portrait.png" });
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // a stale "required" error from the first save attempt is gone
  await expect(page.getByText("Adresa (slug) este obligatorie.")).toHaveCount(0);
  await expect(page.locator("form img").first()).toHaveJSProperty("complete", true);

  if (testInfo.project.name === "phone-portrait" || testInfo.project.name === "desktop") {
    await page.screenshot({ path: `e2e/screenshots/admin-form-${testInfo.project.name}.png`, fullPage: true });
  }

  await page.getByRole("button", { name: "Adaugă evenimentul" }).click();
  await expect(page.getByText("Evenimentul a fost adăugat.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("3 evenimente")).toBeVisible();

  const saved = db.writes.find((w) => w.method === "POST")!.body;
  expect(saved).toMatchObject({
    type: "milonga",
    slug: "milonga-de-iarna-in-oradea",
    status: "published",
    // Romanian winter time is UTC+2
    start_at: "2026-12-05T19:00:00.000Z",
    end_at: "2026-12-06T00:00:00.000Z",
    title: { ro: "Milonga de iarnă în Oradea", en: "Winter milonga in Oradea" },
    summary: { ro: "O seară caldă de tango în plină iarnă." },
    content: null,
    location: "Feeling Dance Studio, Oradea",
    external_url: null,
  });
  expect("created_by" in saved).toBe(false); // set by the database
  expect(String(saved.image_path)).toMatch(new RegExp(`^${EDITOR_ID}/milonga-de-iarna-in-oradea-\\d+\\.(webp|jpg)$`));
  expect(db.uploads).toEqual([saved.image_path]);
});

test("an address already in use is reported on the field", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await page.getByLabel("Titlu (Română) *").fill("Milonga de toamnă");
  await page.getByLabel("Tip *").selectOption("milonga");
  await pickDateTime(page, "Început", "2026-12-05T21:00");
  await pickDateTime(page, "Sfârșit", "2026-12-06T02:00");
  await page.getByRole("button", { name: "Adaugă evenimentul" }).click();
  await expect(page.getByText("Această adresă e deja folosită de alt eveniment. Alege alta.")).toBeVisible();
});

test("editing an event loads it in Romanian time and saves the changes", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Editează" }).locator("visible=true").first().click();
  await expect(page.getByRole("heading", { name: "Editează evenimentul" })).toBeVisible();
  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue(/Festivalul de tango Oradea|Milonga de toamnă/);
  // the address of an existing event does not follow the title
  const slugBefore = await page.getByLabel("Adresa în site *").inputValue();
  await page.getByLabel("Titlu (Română) *").fill("Titlu nou");
  await expect(page.getByLabel("Adresa în site *")).toHaveValue(slugBefore);

  await page.getByRole("button", { name: "Salvează" }).click();
  await expect(page.getByText("Modificările au fost salvate.")).toBeVisible();
  await expect(page.getByText("Titlu nou", { exact: true }).locator("visible=true")).toBeVisible();
  expect(db.writes.find((w) => w.method === "PATCH")!.body).toMatchObject({ title: { ro: "Titlu nou" } });
});

test("logging out returns to the login page", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await expect(page.getByRole("heading", { name: "Evenimentele mele" })).toBeVisible();
  await page.getByRole("button", { name: "Ieșire" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

async function switchTabAwayAndBack(page: Page) {
  // Mark the title field: if the form is rebuilt, the mark disappears.
  await page.getByLabel("Titlu (Română) *").evaluate((el) => el.setAttribute("data-same-form", "yes"));
  await page.evaluate(async () => {
    const set = (state: "hidden" | "visible") => {
      Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
      Object.defineProperty(document, "hidden", { value: state === "hidden", configurable: true });
      // Supabase listens on window; the browser fires it on document.
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event(state === "hidden" ? "blur" : "focus"));
    };
    set("hidden");
    await new Promise((r) => setTimeout(r, 300));
    set("visible");
  });
  await page.waitForTimeout(1500);
  await expect(page.getByLabel("Titlu (Română) *")).toHaveAttribute("data-same-form", "yes");
}

test("switching to another tab and back keeps a half-filled new event", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await page.getByLabel("Titlu (Română) *").fill("Milonga de iarnă");
  await page.getByLabel("Descriere scurtă (Română)").fill("Text copiat din alt tab");

  await switchTabAwayAndBack(page);

  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue("Milonga de iarnă");
  await expect(page.getByLabel("Descriere scurtă (Română)")).toHaveValue("Text copiat din alt tab");
  // the form stayed on screen: it was not rebuilt from the saved draft
  await expect(page.getByText("Am recuperat textele nesalvate")).toHaveCount(0);
});

test("switching tabs while editing does not reload the event over the changes", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Editează" }).locator("visible=true").first().click();
  await page.getByLabel("Titlu (Română) *").fill("Titlu schimbat, încă nesalvat");
  await switchTabAwayAndBack(page);
  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue("Titlu schimbat, încă nesalvat");
  await expect(page.getByText("Am recuperat textele nesalvate")).toHaveCount(0);
});

test("unsaved texts survive a reload and can be discarded", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();

  // an untouched form leaves nothing behind
  await page.reload();
  await expect(page.getByRole("heading", { name: "Eveniment nou" })).toBeVisible();
  await expect(page.getByText("Am recuperat textele nesalvate")).toHaveCount(0);

  await page.getByLabel("Titlu (Română) *").fill("Ciornă nesalvată");
  await page.reload();
  await expect(page.getByText("Am recuperat textele nesalvate de data trecută.")).toBeVisible();
  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue("Ciornă nesalvată");
  await expect(page.getByLabel("Adresa în site *")).toHaveValue("ciorna-nesalvata");

  await page.getByRole("button", { name: "Renunță la ele" }).click();
  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue("");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Eveniment nou" })).toBeVisible();
  await expect(page.getByText("Am recuperat textele nesalvate")).toHaveCount(0);
});

test("a saved event leaves no draft behind", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await page.getByLabel("Titlu (Română) *").fill("Practică de vineri");
  await page.getByLabel("Tip *").selectOption("practica");
  await pickDateTime(page, "Început", "2026-12-03T19:00");
  await pickDateTime(page, "Sfârșit", "2026-12-03T21:00");
  await page.getByRole("button", { name: "Adaugă evenimentul" }).click();
  await expect(page.getByText("Evenimentul a fost adăugat.")).toBeVisible();

  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue("");
  await expect(page.getByText("Am recuperat textele nesalvate")).toHaveCount(0);
});

test("an event added in the admin shows up on an open events page in another tab", async ({ context, page }) => {
  await mockSupabase(context, "ok", { role: "editor" });
  await page.goto("/events");
  await expect(page.getByText("Milonga de toamnă", { exact: true })).toBeVisible();

  const admin = await context.newPage();
  await login(admin);
  await admin.getByRole("link", { name: "Adaugă eveniment" }).click();
  await admin.getByLabel("Titlu (Română) *").fill("Curs pentru începători");
  await admin.getByLabel("Tip *").selectOption("curs");
  const inAWeek = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  await pickDateTime(admin, "Început", `${inAWeek}T19:00`);
  await pickDateTime(admin, "Sfârșit", `${inAWeek}T21:00`);
  await admin.getByRole("radio", { name: "Publicat" }).click();
  await admin.getByRole("button", { name: "Adaugă evenimentul" }).click();
  await expect(admin.getByText("Evenimentul a fost adăugat.")).toBeVisible();

  // the public tab, still on "Toate", updates by itself
  await expect(page.getByText("Curs pentru începători", { exact: true })).toBeVisible();
  await expect(page.getByText("Milonga de toamnă", { exact: true })).toBeVisible();
});

test("the place can be found on the map and is saved with the event", async ({ page }, testInfo) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await page.getByLabel("Titlu (Română) *").fill("Practică de sâmbătă");
  await page.getByLabel("Tip *").selectOption("practica");
  await pickDateTime(page, "Început", "2026-12-12T18:00");
  await pickDateTime(page, "Sfârșit", "2026-12-12T20:00");

  // nothing found -> a helpful hint
  await page.getByRole("searchbox", { name: "Caută adresa pe hartă" }).fill("loc inexistent");
  await page.getByRole("button", { name: "Caută", exact: true }).click();
  await expect(page.getByText("Nu am găsit adresa.")).toBeVisible();

  await page.getByRole("searchbox", { name: "Caută adresa pe hartă" }).fill("Strada Sovata 1B, Oradea");
  await page.getByRole("searchbox", { name: "Caută adresa pe hartă" }).press("Enter"); // does not submit the form
  await page.getByRole("button", { name: /Latino Vibes Studio/ }).click();
  await expect(page.getByLabel("Numele locului și adresa")).toHaveValue("Latino Vibes Studio, 1B, Strada Sovata, Oradea");
  await expect(page.getByText("Punct ales: 47.06310, 21.93720")).toBeVisible();
  await expect(page.getByTestId("location-map").locator(".leaflet-marker-icon")).toHaveCount(1);
  if (testInfo.project.name === "phone-portrait") {
    await page.getByRole("heading", { name: "Locație" }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: "e2e/screenshots/admin-location-phone-portrait.png" });
  }

  await page.getByRole("button", { name: "Adaugă evenimentul" }).click();
  await expect(page.getByText("Evenimentul a fost adăugat.")).toBeVisible();
  expect(db.writes.find((w) => w.method === "POST")!.body).toMatchObject({
    location: "Latino Vibes Studio, 1B, Strada Sovata, Oradea",
    latitude: 47.0631,
    longitude: 21.9372,
  });
});

test("a click on the map places the point, which can be removed", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  const map = page.getByTestId("location-map");
  await map.scrollIntoViewIfNeeded();
  await map.click({ position: { x: 120, y: 100 } });
  await expect(page.getByText(/^Punct ales: 4\d\.\d{5}, 2\d\.\d{5}/)).toBeVisible();
  await expect(map.locator(".leaflet-marker-icon")).toHaveCount(1);

  await page.getByRole("button", { name: "Șterge punctul" }).click();
  await expect(map.locator(".leaflet-marker-icon")).toHaveCount(0);

  await page.getByLabel("Titlu (Română) *").fill("Fără punct pe hartă");
  await page.getByLabel("Tip *").selectOption("altul");
  await pickDateTime(page, "Început", "2026-12-12T18:00");
  await page.getByRole("button", { name: "Adaugă evenimentul" }).click();
  await expect(page.getByText("Evenimentul a fost adăugat.")).toBeVisible();
  expect(db.writes.find((w) => w.method === "POST")!.body).toMatchObject({ latitude: null, longitude: null });
});

test("the date picker: Romanian calendar, gold icon, end follows the start", async ({ page }, testInfo) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  const startButton = page.getByRole("button", { name: /^Început:/ });
  await expect(startButton).toContainText("Alege data");
  await expect(startButton.locator("svg")).not.toHaveCSS("color", "rgb(0, 0, 0)");

  await startButton.click();
  await expect(page.getByRole("grid")).toBeVisible();
  if (testInfo.project.name === "phone-portrait") {
    await page.waitForTimeout(400); // let the opening animation finish
    await page.screenshot({ path: "e2e/screenshots/admin-datepicker-phone-portrait.png" });
  }
  await page.keyboard.press("Escape");

  await pickDateTime(page, "Început", "2026-12-05T21:30");
  await expect(startButton).toContainText(/sâmbătă, 5 decembrie 2026/i);
  await expect(page.getByLabel("Început: ora")).toHaveValue("21");
  await expect(page.getByLabel("Început: minutele")).toHaveValue("30");
  // the end is pre-filled with the start, ready to adjust
  await expect(page.getByRole("button", { name: /^Sfârșit:/ })).toContainText(/sâmbătă, 5 decembrie 2026/i);
  await expect(page.getByLabel("Sfârșit: ora")).toHaveValue("21");
});

test("the end can never be set before the start", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await pickDateTime(page, "Început", "2026-12-05T21:30");

  // days before the start are disabled in the end calendar
  await page.getByRole("grid").waitFor({ state: "detached" });
  await page.getByRole("button", { name: /^Sfârșit:/ }).click();
  const days = page.getByRole("grid").locator('button[name="day"]:not(.day-outside)');
  await expect(days.getByText("4", { exact: true })).toBeDisabled();
  await expect(days.getByText("5", { exact: true })).toBeEnabled();
  await expect(days.getByText("6", { exact: true })).toBeEnabled();
  await page.keyboard.press("Escape");

  // on the start day, earlier hours and minutes are disabled
  const endHour = page.getByLabel("Sfârșit: ora");
  await expect(endHour.locator('option[value="20"]')).toBeDisabled();
  await expect(endHour.locator('option[value="21"]')).toBeEnabled();
  await expect(page.getByLabel("Sfârșit: minutele").locator('option[value="25"]')).toBeDisabled();
  await expect(page.getByLabel("Sfârșit: minutele").locator('option[value="30"]')).toBeEnabled();

  // the next day has no limits
  await pickDateTime(page, "Sfârșit", "2026-12-06T02:00");
  await expect(endHour.locator('option[value="00"]')).toBeEnabled();

  // moving the start past the end pushes the end along
  await pickDateTime(page, "Început", "2026-12-08T19:00");
  await expect(page.getByRole("button", { name: /^Sfârșit:/ })).toContainText(/8 decembrie 2026/);
  // still not before the start (19:00)
  expect(Number(await endHour.inputValue())).toBeGreaterThanOrEqual(19);
});

test("a new event can be pre-filled from a link (title, description, photo, link)", async ({ page }, testInfo) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();

  await page.getByLabel("Completează din link (opțional)").fill("https://www.facebook.com/events/42");
  await page.getByLabel("Completează din link (opțional)").press("Enter"); // does not submit the form
  await expect(page.getByText(/^Am completat: titlul, descrierea scurtă, descrierea completă, linkul extern, poza/)).toBeVisible();

  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue("Milonga la castel");
  await expect(page.getByLabel("Adresa în site *")).toHaveValue("milonga-la-castel");
  const summary = await page.getByLabel("Descriere scurtă (Română)").inputValue();
  expect(summary.length).toBeLessThanOrEqual(300);
  expect(summary.startsWith("O seară de tango în curtea castelului.")).toBe(true);
  await expect(page.getByLabel("Descriere completă (Română)")).toHaveValue(/Muzică live, dans și prieteni/);
  await expect(page.getByLabel("Link extern")).toHaveValue("https://www.facebook.com/events/42");
  expect(db.uploads).toHaveLength(1);
  expect(db.uploads[0]).toMatch(/milonga-la-castel-\d+\.(webp|jpg)$/);
  await expect(page.getByRole("button", { name: "Fără poză" })).toBeVisible();

  if (testInfo.project.name === "phone-portrait") {
    await page.screenshot({ path: "e2e/screenshots/admin-prefill-phone-portrait.png" });
  }
});

test("pre-filling never overwrites what was already typed", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await page.getByLabel("Titlu (Română) *").fill("Titlul meu");
  await page.getByLabel("Completează din link (opțional)").fill("https://www.facebook.com/events/42");
  await page.getByRole("button", { name: "Preia datele" }).click();
  await expect(page.getByText(/^Am completat: descrierea scurtă/)).toBeVisible();
  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue("Titlul meu");
  expect(db.uploads).toHaveLength(1);
});

test("a page without preview tags is explained", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await page.getByLabel("Completează din link (opțional)").fill("https://example.ro/fara-meta");
  await page.getByRole("button", { name: "Preia datele" }).click();
  await expect(page.getByText(/Pagina nu are informații de previzualizare/)).toBeVisible();
  await expect(page.getByLabel("Titlu (Română) *")).toHaveValue("");
});
