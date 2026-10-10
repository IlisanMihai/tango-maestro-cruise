import type { Page } from "@playwright/test";

const MONTHS_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

/** Picks "YYYY-MM-DDTHH:mm" with the admin date-time picker (calendar + hour/minute lists). */
export async function pickDateTime(page: Page, label: "Început" | "Sfârșit", value: string) {
  const [day, time] = value.split("T");
  const [y, m, d] = day.split("-").map(Number);
  const [hour, minute] = time.split(":");

  // Wait for a previously opened calendar to finish closing.
  await page.getByRole("grid").waitFor({ state: "detached" });
  await page.getByRole("button", { name: new RegExp(`^${label}:`) }).click();
  const grid = page.getByRole("grid");
  for (let i = 0; i < 36; i++) {
    // The month grid is labelled by its caption, e.g. "decembrie 2026".
    const captionId = await grid.getAttribute("aria-labelledby");
    const caption = await page.locator(`[id="${captionId}"]`).innerText();
    const [monthName, year] = caption.trim().toLowerCase().split(/\s+/);
    const shown = Number(year) * 12 + MONTHS_RO.indexOf(monthName);
    const wanted = y * 12 + (m - 1);
    if (shown === wanted) break;
    await page.getByRole("button", { name: shown < wanted ? "Luna următoare" : "Luna anterioară" }).click();
  }
  await grid.locator('button[name="day"]:not(.day-outside)').getByText(String(d), { exact: true }).click();
  await page.getByLabel(`${label}: ora`).selectOption(hour);
  await page.getByLabel(`${label}: minutele`).selectOption(minute);
}
