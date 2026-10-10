import type { EventRow, EventType, I18nText } from "@/lib/supabase";
import { supabaseUrl } from "@/lib/supabaseConfig";
import { INTL_LOCALES, type Language } from "@/i18n/languages";

export const EVENT_TIME_ZONE = "Europe/Bucharest";

/** Every event type, in database order (the UI sorts them by label, "altul" last). */
export const EVENT_TYPES: EventType[] = [
  "altul",
  "curs",
  "encuentro",
  "festival",
  "maraton",
  "milonga",
  "practica",
  "workshop",
];

export const isEventType = (value: unknown): value is EventType =>
  typeof value === "string" && (EVENT_TYPES as string[]).includes(value);

/** "?type=milonga,practica" -> ["milonga", "practica"] (unknown values dropped, stable order). */
export function parseEventTypes(param: string | null): EventType[] {
  const wanted = new Set((param ?? "").split(","));
  return EVENT_TYPES.filter((type) => wanted.has(type));
}

export const PAST_PAGE_SIZE = 12;

async function client() {
  // Loaded on demand: keeps the Supabase client out of the main bundle.
  const { supabase } = await import("@/lib/supabase");
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

/** Published events that have not ended yet, soonest first (RLS already hides drafts from visitors). */
export async function fetchUpcomingEvents(limit: number, now = new Date()): Promise<EventRow[]> {
  return fetchActiveEvents({ limit, now });
}

/**
 * "Active" tab: events whose end has not passed, by start date. A course that
 * started last month and still runs comes first.
 */
export async function fetchActiveEvents({
  types,
  limit = 200,
  now = new Date(),
}: { types?: EventType[]; limit?: number; now?: Date } = {}): Promise<EventRow[]> {
  const supabase = await client();
  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("end_at", now.toISOString());
  // No types selected = all types.
  if (types?.length) query = query.in("type", types);
  const { data, error } = await query.order("start_at", { ascending: true }).limit(limit);
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

/** "Past" tab, most recent first, one page of PAST_PAGE_SIZE at a time. */
export async function fetchPastEvents({
  types,
  page = 0,
  now = new Date(),
}: { types?: EventType[]; page?: number; now?: Date } = {}): Promise<{ events: EventRow[]; hasMore: boolean }> {
  const supabase = await client();
  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .lt("end_at", now.toISOString());
  // No types selected = all types.
  if (types?.length) query = query.in("type", types);
  const from = page * PAST_PAGE_SIZE;
  // One extra row tells whether another page exists.
  const { data, error } = await query
    .order("end_at", { ascending: false })
    .range(from, from + PAST_PAGE_SIZE);
  if (error) throw error;
  const rows = (data ?? []) as EventRow[];
  return { events: rows.slice(0, PAST_PAGE_SIZE), hasMore: rows.length > PAST_PAGE_SIZE };
}

/** Display name of whoever added a published event (never the email); null if unknown. */
export async function fetchEventAuthorName(eventId: string): Promise<string | null> {
  const supabase = await client();
  const { data, error } = await supabase.rpc("event_author_name", { event_id: eventId });
  if (error) throw error;
  return typeof data === "string" && data.trim() ? data.trim() : null;
}

/** A published event by slug, or null when it does not exist (or is a draft). */
export async function fetchEventBySlug(slug: string): Promise<EventRow | null> {
  const supabase = await client();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return (data as EventRow | null) ?? null;
}

export function hasEnded(event: Pick<EventRow, "end_at">, now = new Date()): boolean {
  return new Date(event.end_at).getTime() < now.getTime();
}

const calendarStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** "Add to Google Calendar" link (no account data leaves the site until the visitor clicks). */
export function googleCalendarUrl(event: EventRow, language: Language, pageUrl: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: localizedText(event.title, language),
    dates: `${calendarStamp(event.start_at)}/${calendarStamp(event.end_at)}`,
    details: [localizedText(event.summary, language), pageUrl].filter(Boolean).join("\n\n"),
    ctz: EVENT_TIME_ZONE,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Text in the requested language, falling back to Romanian. */
export function localizedText(text: I18nText | null | undefined, language: Language): string {
  if (!text) return "";
  return text[language]?.trim() || text.ro;
}

/** Google Maps link: the exact point picked in the admin, else a search for the address. */
export function mapsUrl(event: Pick<EventRow, "location" | "latitude" | "longitude">): string {
  const query =
    event.latitude !== null && event.longitude !== null && event.latitude !== undefined && event.longitude !== undefined
      ? `${event.latitude},${event.longitude}`
      : event.location ?? "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Public URL of a file in the 'event-images' bucket (same format as storage.getPublicUrl). */
export function eventImageUrl(imagePath: string | null): string | null {
  if (!imagePath || !supabaseUrl) return null;
  const encoded = imagePath.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/event-images/${encoded}`;
}

type RangeFormat = Intl.DateTimeFormat & { formatRange(start: Date, end: Date): string };

/**
 * Human date for a card, in Romanian time:
 * - one evening (≤ 18 h):  "sâmbătă, 23 mai 2026, 21:00–02:00"
 * - several days:          "23–24 mai 2026"
 */
export function formatEventDates(startAt: string, endAt: string, language: Language): string {
  const locale = INTL_LOCALES[language];
  const start = new Date(startAt);
  const end = new Date(endAt);
  const hours = (end.getTime() - start.getTime()) / 36e5;

  if (hours <= 18) {
    const day = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: EVENT_TIME_ZONE,
    }).format(start);
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: EVENT_TIME_ZONE,
    });
    const times = hours > 0 ? `${time.format(start)}–${time.format(end)}` : time.format(start);
    return `${day}, ${times}`;
  }

  const range = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  }) as RangeFormat;
  return range.formatRange(start, end);
}
