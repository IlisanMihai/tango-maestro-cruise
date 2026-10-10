import { describe, expect, it } from "vitest";
import { fromBucharestInput, toBucharestInput } from "./datetime";
import { slugify, SLUG_PATTERN } from "./slug";
import { emptyEventForm, eventFormSchema, eventFromForm, formFromEvent, type EventFormValues } from "./eventForm";
import { EVENT_TYPE_OPTIONS } from "./labels";
import type { EventRow } from "@/lib/supabase";

describe("Romanian time in the form", () => {
  it("converts summer time (UTC+3)", () => {
    expect(fromBucharestInput("2026-05-23T21:00")).toBe("2026-05-23T18:00:00.000Z");
    expect(toBucharestInput("2026-05-23T18:00:00Z")).toBe("2026-05-23T21:00");
  });

  it("converts winter time (UTC+2)", () => {
    expect(fromBucharestInput("2026-12-05T21:00")).toBe("2026-12-05T19:00:00.000Z");
    expect(toBucharestInput("2026-12-05T19:00:00Z")).toBe("2026-12-05T21:00");
  });

  it("round-trips across the October clock change", () => {
    for (const value of ["2026-10-24T23:30", "2026-10-25T05:00", "2026-03-29T05:00"]) {
      expect(toBucharestInput(fromBucharestInput(value))).toBe(value);
    }
  });
});

describe("slugify", () => {
  it("drops diacritics and punctuation", () => {
    expect(slugify("Milonga de toamnă – ediția 2026!")).toBe("milonga-de-toamna-editia-2026");
    expect(slugify("  Șezătoare Țărănească  ")).toBe("sezatoare-taraneasca");
  });

  it("always matches the database rule (or is empty)", () => {
    for (const text of ["---", "Ápríl ÜNNEP", "a  b", "x".repeat(200)]) {
      const slug = slugify(text);
      expect(slug === "" || SLUG_PATTERN.test(slug)).toBe(true);
      expect(slug.length).toBeLessThanOrEqual(80);
    }
  });
});

const valid = (): EventFormValues => ({
  ...emptyEventForm(),
  type: "milonga",
  start: "2026-11-07T21:00",
  end: "2026-11-08T02:00",
  slug: "milonga-de-toamna",
  status: "published",
  title: { ro: "Milonga de toamnă", en: "Autumn milonga", hu: "", es: "", sk: "" },
});

const errorsOf = (values: EventFormValues) => {
  const result = eventFormSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe("event form validation", () => {
  it("accepts a complete form", () => {
    expect(errorsOf(valid())).toEqual([]);
  });

  it("requires the Romanian title, a type and both dates", () => {
    const messages = errorsOf({ ...emptyEventForm(), slug: "x" });
    expect(messages).toContain("Titlul în română este obligatoriu.");
    expect(messages).toContain("Alege tipul evenimentului.");
    expect(messages).toContain("Alege data și ora de început.");
  });

  it("rejects an end before the start", () => {
    expect(errorsOf({ ...valid(), end: "2026-11-07T20:00" })).toContain("Sfârșitul nu poate fi înainte de început.");
  });

  it("rejects a translation without the Romanian text", () => {
    const values = valid();
    values.summary = { ...values.summary, en: "Only English" };
    expect(errorsOf(values)).toContain("Completează și descrierea scurtă în română.");
  });

  it("rejects bad slugs and links", () => {
    expect(errorsOf({ ...valid(), slug: "Milonga Toamnă" })[0]).toMatch(/litere mici/);
    expect(errorsOf({ ...valid(), external_url: "facebook.com/x" })).toContain("Linkul trebuie să înceapă cu https://");
  });
});

describe("form <-> database row", () => {
  it("stores only filled languages and empty fields as null", () => {
    const payload = eventFromForm(valid());
    expect(payload.title).toEqual({ ro: "Milonga de toamnă", en: "Autumn milonga" });
    expect(payload.summary).toBeNull();
    expect(payload.location).toBeNull();
    expect(payload.start_at).toBe("2026-11-07T19:00:00.000Z");
  });

  it("stores a map point only as a complete pair", () => {
    expect(eventFromForm({ ...valid(), latitude: 47.06, longitude: 21.93 })).toMatchObject({ latitude: 47.06, longitude: 21.93 });
    expect(eventFromForm({ ...valid(), latitude: 47.06, longitude: null })).toMatchObject({ latitude: null, longitude: null });
  });

  it("round-trips an event", () => {
    const row = {
      ...eventFromForm(valid()),
      id: "1",
      created_by: "u",
      created_at: "",
      updated_at: "",
    } as EventRow;
    expect(formFromEvent(row)).toEqual(valid());
  });
});

it("type options are alphabetical with 'altul' last", () => {
  expect(EVENT_TYPE_OPTIONS).toEqual(["curs", "encuentro", "festival", "maraton", "milonga", "practica", "workshop", "altul"]);
});
