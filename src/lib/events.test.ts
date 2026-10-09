import { describe, expect, it } from "vitest";
import { formatEventDates, localizedText } from "./events";

describe("localizedText", () => {
  const text = { ro: "Milonga de toamnă", en: "Autumn milonga", hu: "  " };

  it("uses the requested language", () => {
    expect(localizedText(text, "en")).toBe("Autumn milonga");
  });

  it("falls back to Romanian when missing or blank", () => {
    expect(localizedText(text, "es")).toBe("Milonga de toamnă");
    expect(localizedText(text, "hu")).toBe("Milonga de toamnă");
    expect(localizedText(null, "en")).toBe("");
  });
});

describe("formatEventDates (Romanian time)", () => {
  it("shows day and hours for an evening that ends after midnight", () => {
    // 23 May 2026, 21:00–02:00 in Bucharest (UTC+3)
    const text = formatEventDates("2026-05-23T18:00:00Z", "2026-05-23T23:00:00Z", "ro");
    expect(text).toContain("23 mai 2026");
    expect(text).toContain("21:00");
    expect(text).toContain("02:00");
  });

  it("shows a date range for a multi-day event", () => {
    const text = formatEventDates("2026-05-23T10:00:00Z", "2026-05-24T14:45:00Z", "en");
    expect(text).toMatch(/23\s*[–-]\s*24 May 2026/);
  });

  it("shows only the start time when start equals end", () => {
    const text = formatEventDates("2026-11-07T19:00:00Z", "2026-11-07T19:00:00Z", "ro");
    expect(text).toContain("21:00");
    expect(text).not.toContain("–");
  });
});
