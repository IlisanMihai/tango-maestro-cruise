import type { EventRow, I18nText } from "@/lib/supabase";
import { supabaseUrl } from "@/lib/supabaseConfig";
import { INTL_LOCALES, type Language } from "@/i18n/languages";

export const EVENT_TIME_ZONE = "Europe/Bucharest";

/** Published events that have not ended yet, soonest first (RLS already hides drafts from visitors). */
export async function fetchUpcomingEvents(limit: number, now = new Date()): Promise<EventRow[]> {
  // Loaded on demand: keeps the Supabase client out of the main bundle.
  const { supabase } = await import("@/lib/supabase");
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("end_at", now.toISOString())
    .order("start_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

/** Text in the requested language, falling back to Romanian. */
export function localizedText(text: I18nText | null | undefined, language: Language): string {
  if (!text) return "";
  return text[language]?.trim() || text.ro;
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
