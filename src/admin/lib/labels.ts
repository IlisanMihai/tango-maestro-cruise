import { EVENT_TYPES } from "@/lib/events";
import type { EventType, Locale } from "@/lib/supabase";
import roCommon from "@/locales/ro/common.json";

/** The admin area is in Romanian: type names come from the Romanian site texts. */
export const EVENT_TYPE_LABELS = Object.fromEntries(
  EVENT_TYPES.map((type) => [type, roCommon[`event.type.${type}` as keyof typeof roCommon]]),
) as Record<EventType, string>;

/** Types for the form's dropdown: alphabetical, "Altul" last (same order as the public filters). */
export const EVENT_TYPE_OPTIONS: EventType[] = [
  ...EVENT_TYPES.filter((type) => type !== "altul").sort((a, b) =>
    EVENT_TYPE_LABELS[a].localeCompare(EVENT_TYPE_LABELS[b], "ro"),
  ),
  "altul",
];

export const LANGUAGE_NAMES: Record<Locale, string> = {
  ro: "Română",
  en: "English",
  hu: "Magyar",
  es: "Español",
  sk: "Slovenčina",
};
