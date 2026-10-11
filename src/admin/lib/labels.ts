import { EVENT_TYPE_FILTER_ORDER } from "@/lib/events";
import type { EventType, Locale } from "@/lib/supabase";

/** Types in the form's dropdown: the same fixed order as the filters on the site. */
export const EVENT_TYPE_OPTIONS: EventType[] = EVENT_TYPE_FILTER_ORDER;

/** Each language in its own name, for the text tabs of the event form. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  ro: "Română",
  en: "English",
  hu: "Magyar",
  es: "Español",
  sk: "Slovenčina",
};
