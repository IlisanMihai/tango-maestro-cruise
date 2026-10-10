import { readFileSync } from "node:fs";
import type { BrowserContext, Page } from "@playwright/test";

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
    latitude: 47.0599,
    longitude: 21.9271,
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

export const ADMIN_ID = "aaaaaaaa-0000-4000-a000-000000000001";
export const EDITOR_ID = "eeeeeeee-0000-4000-a000-000000000002";
// Fake test login used only against these mocked endpoints.
export const TEST_EMAIL = "editor@test.local";
export const TEST_PASSWORD = "test-password-123";

// The first two upcoming events belong to the editor.
fixtureEvents[0].created_by = EDITOR_ID;
fixtureEvents[1].created_by = EDITOR_ID;

type Auth = { role: "admin" | "editor"; active?: boolean; profileDelayMs?: number };

const b64url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

function fakeSession(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const user = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email: TEST_EMAIL,
    app_metadata: { provider: "email" },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const token = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub: userId, exp: now + 3600, role: "authenticated" })}.sig`;
  return { access_token: token, token_type: "bearer", expires_in: 3600, expires_at: now + 3600, refresh_token: "refresh", user };
}

function applyFilters(rows: Row[], params: URLSearchParams) {
  for (const [key, value] of params) {
    const [op, ...rest] = value.split(".");
    const arg = rest.join(".");
    if (["select", "order", "limit", "offset", "columns"].includes(key)) continue;
    rows = rows.filter((row) => {
      const field = String(row[key]);
      if (op === "eq") return field === arg;
      if (op === "in") return arg.replace(/^\(|\)$/g, "").split(",").includes(field);
      if (op === "gte") return field >= new Date(arg).toISOString();
      if (op === "lt") return field < new Date(arg).toISOString();
      return true;
    });
  }
  return rows;
}

/**
 * Answers supabase-js requests like Supabase would: PostgREST reads (eq, in, gte,
 * lt, order, limit, offset), and, with `auth`, a password login, the profile,
 * event writes and photo uploads. Writes are kept in memory for the test.
 * `writes` records every insert/update body for assertions.
 */
export async function mockSupabase(page: Page | BrowserContext, mode: "ok" | "fail" = "ok", auth?: Auth) {
  const events: Row[] = fixtureEvents.map((e) => ({ ...e }));
  const writes: { method: string; body: Record<string, unknown> }[] = [];
  const uploads: string[] = [];
  const userId = auth?.role === "admin" ? ADMIN_ID : EDITOR_ID;

  await page.route("**/rest/v1/events**", async (route) => {
    if (mode === "fail") return route.abort();
    const request = route.request();
    const params = new URL(request.url()).searchParams;
    const single = (request.headers()["accept"] ?? "").includes("vnd.pgrst.object");
    const reply = (rows: Row[]) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(single ? rows[0] ?? null : rows),
      });

    if (request.method() === "POST") {
      const body = request.postDataJSON();
      writes.push({ method: "POST", body });
      if (events.some((e) => e.slug === body.slug)) {
        return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ code: "23505", message: "duplicate key" }) });
      }
      const row = { ...body, id: `new-${events.length}`, created_by: userId, created_at: "", updated_at: "" } as Row;
      events.push(row);
      return reply([row]);
    }
    if (request.method() === "PATCH") {
      const body = request.postDataJSON();
      writes.push({ method: "PATCH", body });
      const matched = applyFilters(events, params);
      matched.forEach((row) => Object.assign(row, body));
      return reply(matched);
    }
    if (request.method() === "DELETE") {
      const matched = new Set(applyFilters(events, params));
      for (let i = events.length - 1; i >= 0; i--) if (matched.has(events[i])) events.splice(i, 1);
      return route.fulfill({ status: 204 });
    }

    let rows = applyFilters([...events], params);
    const order = params.get("order");
    if (order) {
      const [field, dir] = order.split(".");
      rows.sort((a, b) => String(a[field]).localeCompare(String(b[field])) * (dir === "desc" ? -1 : 1));
    }
    const offset = Number(params.get("offset") ?? 0);
    const limit = params.has("limit") ? Number(params.get("limit")) : rows.length;
    rows = rows.slice(offset, offset + limit);
    return reply(rows);
  });

  if (auth) {
    // Map tiles and the address search used by the admin location picker.
    const blankTile = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    );
    await page.route("https://tile.openstreetmap.org/**", (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: blankTile }),
    );
    await page.route("https://nominatim.openstreetmap.org/search**", (route) => {
      const q = new URL(route.request().url()).searchParams.get("q") ?? "";
      const results = /sovata/i.test(q)
        ? [
            {
              lat: "47.0631",
              lon: "21.9372",
              display_name: "Latino Vibes Studio, 1B, Strada Sovata, Oradea, Bihor, 410000, România",
            },
          ]
        : [];
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(results) });
    });
    await page.route("**/auth/v1/token**", async (route) => {
      const body = route.request().postDataJSON() ?? {};
      if (body.email === TEST_EMAIL && body.password === TEST_PASSWORD) {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeSession(userId)) });
      }
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" }),
      });
    });
    await page.route("**/auth/v1/user**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeSession(userId).user) }),
    );
    await page.route("**/auth/v1/logout**", (route) => route.fulfill({ status: 204 }));
    await page.route("**/rest/v1/profiles**", async (route) => {
      if (auth.profileDelayMs) await new Promise((resolve) => setTimeout(resolve, auth.profileDelayMs));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: userId, email: TEST_EMAIL, name: auth.role === "admin" ? "Admin Test" : "Editor Test", role: auth.role, active: auth.active ?? true },
        ]),
      });
    });
    // Public URLs of uploaded photos: serve a real image.
    await page.route("**/storage/v1/object/public/event-images/**", (route) =>
      route.fulfill({ status: 200, contentType: "image/webp", body: readFileSync("src/assets/hero-mobile.webp") }),
    );
    await page.route("**/storage/v1/object/event-images/**", async (route) => {
      const path = decodeURIComponent(new URL(route.request().url()).pathname.split("/event-images/")[1]);
      uploads.push(path);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ Key: `event-images/${path}`, Id: "1" }) });
    });
  }

  return { events, writes, uploads };
}
