import { readFileSync } from "node:fs";
import { test, expect, type Page } from "../playwright-fixture";
import { TEST_EMAIL, TEST_PASSWORD, mockSupabase } from "./support/supabaseMock";

// Type names as written in the English site texts (they may be edited).
const enCommon = JSON.parse(readFileSync("src/locales/en/common.json", "utf8")) as Record<string, string>;
const FILTER_ORDER = ["curs", "practica", "milonga", "festival", "workshop", "maraton", "encuentro", "altul"];

async function login(page: Page, submit = "Intră în cont") {
  await page.getByLabel(/^(Email|Parolă|Password)$/).first().fill(TEST_EMAIL);
  await page.locator("#password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: submit }).click();
}

test("the admin can be switched to English and back to Romanian", async ({ page }, testInfo) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await page.goto("/admin/login");
  await expect(page.getByText("Intră în cont ca să adaugi și să modifici evenimente.")).toBeVisible();

  const switcher = page.getByRole("group", { name: "Limba administrării" });
  await switcher.getByRole("button", { name: "EN" }).click();
  await expect(page.getByText("Sign in to add and edit events.")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await login(page, "Sign in");
  await expect(page.getByRole("heading", { name: "My events" })).toBeVisible();
  await expect(page.getByText("2 events")).toBeVisible();
  await expect(page.getByRole("link", { name: "My account" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Add event" })).toBeVisible();

  // the choice is remembered
  await page.reload();
  await expect(page.getByRole("heading", { name: "My events" })).toBeVisible();

  // the event form, its validation and the calendar are in English too
  await page.getByRole("link", { name: "Add event" }).click();
  await expect(page.getByRole("heading", { name: "New event" })).toBeVisible();
  await expect(page.getByLabel("Type *").locator("option")).toHaveText([
    "Choose the type",
    ...FILTER_ORDER.map((type) => enCommon[`event.type.${type}`]),
  ]);
  await page.getByRole("button", { name: "Add the event" }).click();
  await expect(page.getByText("The Romanian title is required.")).toBeVisible();
  await page.getByRole("button", { name: /^Start: choose the date/ }).click();
  await expect(page.getByRole("button", { name: "Next month" })).toBeVisible();
  const captionId = await page.getByRole("grid").getAttribute("aria-labelledby");
  await expect(page.locator(`[id="${captionId}"]`)).toHaveText(
    /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/,
  );
  await page.keyboard.press("Escape");
  if (testInfo.project.name === "phone-portrait") {
    await page.screenshot({ path: "e2e/screenshots/admin-english-phone-portrait.png" });
  }

  // back to Romanian
  await page.getByRole("group", { name: "Admin language" }).getByRole("button", { name: "RO" }).click();
  await expect(page.getByRole("heading", { name: "Eveniment nou" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
});

test("the admin language does not change the public site's language", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await page.goto("/admin/login");
  await page.getByRole("group", { name: "Limba administrării" }).getByRole("button", { name: "EN" }).click();
  await expect(page.getByText("Sign in to add and edit events.")).toBeVisible();

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tango argentinian");
});

test("in Romanian, the type list follows the same order as the site filters", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await page.goto("/admin/login");
  await login(page);
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await expect(page.getByLabel("Tip *").locator("option")).toHaveText([
    "Alege tipul",
    "Curs",
    "Practică",
    "Milonga",
    "Festival",
    "Workshop",
    "Maraton",
    "Encuentro",
    "Altul",
  ]);
});
