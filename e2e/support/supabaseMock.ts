import type { Page } from "@playwright/test";

const DAY = 24 * 60 * 60 * 1000;
const at = (days: number, hourUtc: number) => {
  const d = new Date(Date.now() + days * DAY);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toISOString();
};

type Row = Record<string, unknown> & { slug: string; type: string; start_at: string; end_at: string };

const base = (i: number) => ({
  id: `00000000-0000-4000-a000-${String(i).padStart(12, "0")}`,
  content: null,
  image_path: null,
  external_url: null,
  status: "published",
  created_by: null,
  created_at: "",
  updated_at: "",
});

const upcoming: Row[] = [
  {
    slug: "milonga-de-toamna",
    type: "milonga",
    start_at: at(3, 18),
    end_at: at(3, 23),
    title: { ro: "Milonga de toamnă", en: "Autumn milonga" },
    summary: {
      ro: "O seară caldă de tango, cu muzică de epocă de aur și invitați din toată țara.",
      en: "A warm tango evening with golden-age music and guests from all over the country.",
    },
    content: {
      ro: "Program:\n21:00 – deschidere\n23:00 – cortina\n\nIntrarea: 30 lei.",
      en: "Programme:\n21:00 – opening\n23:00 – cortina\n\nEntry: 30 lei.",
    },
    location: "Feeling Dance Studio, Oradea",
    external_url: "https://www.facebook.com/events/1",
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
].map((e, i) => ({ ...base(i), ...e }));

// 14 past events: one more page than PAST_PAGE_SIZE (12).
const past: Row[] = Array.from({ length: 14 }, (_, i) => ({
  ...base(100 + i),
  slug: `milonga-trecuta-${i + 1}`,
  type: i % 3 === 0 ? "workshop" : "milonga",
  start_at: at(-7 * (i + 1), 18),
  end_at: at(-7 * (i + 1), 22),
  title: { ro: `Milonga trecută ${i + 1}`, en: `Past milonga ${i + 1}` },
  summary: { ro: "O seară frumoasă.", en: "A lovely evening." },
  location: "Oradea",
}));

export const fixtureEvents: Row[] = [...upcoming, ...past];

/**
 * Answers supabase-js requests to /rest/v1/events like PostgREST would,
 * for the filters the site uses (eq, gte, lt, order, limit, offset).
 */
export async function mockSupabase(page: Page, mode: "ok" | "fail" = "ok") {
  await page.route("**/rest/v1/events**", async (route) => {
    if (mode === "fail") return route.abort();
    const params = new URL(route.request().url()).searchParams;
    let rows = [...fixtureEvents];
    for (const [key, value] of params) {
      const [op, ...rest] = value.split(".");
      const arg = rest.join(".");
      if (["select", "order", "limit", "offset"].includes(key)) continue;
      rows = rows.filter((row) => {
        const field = String(row[key]);
        if (op === "eq") return field === arg;
        if (op === "in") return arg.replace(/^\(|\)$/g, "").split(",").includes(field);
        if (op === "gte") return field >= new Date(arg).toISOString();
        if (op === "lt") return field < new Date(arg).toISOString();
        return true;
      });
    }
    const order = params.get("order");
    if (order) {
      const [field, dir] = order.split(".");
      rows.sort((a, b) => String(a[field]).localeCompare(String(b[field])) * (dir === "desc" ? -1 : 1));
    }
    const offset = Number(params.get("offset") ?? 0);
    const limit = params.has("limit") ? Number(params.get("limit")) : rows.length;
    rows = rows.slice(offset, offset + limit);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(rows) });
  });
}
