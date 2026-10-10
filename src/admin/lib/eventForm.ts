import { z } from "zod";
import { EVENT_TYPES } from "@/lib/events";
import type { EventRow, EventType, I18nText, Locale } from "@/lib/supabase";
import { LANGUAGES } from "@/i18n/languages";
import { fromBucharestInput, toBucharestInput } from "./datetime";
import { SLUG_PATTERN } from "./slug";

type TextByLanguage = Record<Locale, string>;

const emptyTexts = (): TextByLanguage => ({ ro: "", en: "", hu: "", es: "", sk: "" });

const texts = z.object({ ro: z.string(), en: z.string(), hu: z.string(), es: z.string(), sk: z.string() });

/** A translated field may stay empty, but once any language is filled, Romanian is required. */
const romanianIfAny = (value: TextByLanguage) =>
  value.ro.trim() !== "" || LANGUAGES.every((lng) => value[lng].trim() === "");

export const eventFormSchema = z
  .object({
    type: z.enum(EVENT_TYPES as [EventType, ...EventType[]], {
      errorMap: () => ({ message: "Alege tipul evenimentului." }),
    }),
    start: z.string().min(1, "Alege data și ora de început."),
    end: z.string().min(1, "Alege data și ora de sfârșit."),
    slug: z
      .string()
      .min(1, "Adresa (slug) este obligatorie.")
      .regex(SLUG_PATTERN, "Doar litere mici fără diacritice, cifre și cratime (ex. milonga-de-toamna)."),
    status: z.enum(["draft", "published"]),
    location: z.string(),
    external_url: z
      .string()
      .trim()
      .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Linkul trebuie să înceapă cu https://"),
    image_path: z.string().nullable(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    title: texts.refine((v) => v.ro.trim() !== "", { message: "Titlul în română este obligatoriu.", path: ["ro"] }),
    summary: texts.refine(romanianIfAny, { message: "Completează și descrierea scurtă în română.", path: ["ro"] }),
    content: texts.refine(romanianIfAny, { message: "Completează și descrierea completă în română.", path: ["ro"] }),
  })
  .refine((v) => !v.start || !v.end || v.end >= v.start, {
    message: "Sfârșitul nu poate fi înainte de început.",
    path: ["end"],
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function emptyEventForm(): EventFormValues {
  return {
    type: undefined as unknown as EventType,
    start: "",
    end: "",
    slug: "",
    status: "draft",
    location: "",
    external_url: "",
    image_path: null,
    latitude: null,
    longitude: null,
    title: emptyTexts(),
    summary: emptyTexts(),
    content: emptyTexts(),
  };
}

const textsFrom = (value: I18nText | null): TextByLanguage => ({ ...emptyTexts(), ...(value ?? {}) });

/** Only filled languages are stored; an all-empty field becomes null. */
function textsTo(value: TextByLanguage): I18nText | null {
  const filled = Object.fromEntries(
    LANGUAGES.map((lng) => [lng, value[lng].trim()]).filter(([, text]) => text !== ""),
  ) as Partial<Record<Locale, string>>;
  return filled.ro ? (filled as I18nText) : null;
}

export function formFromEvent(event: EventRow): EventFormValues {
  return {
    type: event.type,
    start: toBucharestInput(event.start_at),
    end: toBucharestInput(event.end_at),
    slug: event.slug,
    status: event.status,
    location: event.location ?? "",
    external_url: event.external_url ?? "",
    image_path: event.image_path,
    latitude: event.latitude ?? null,
    longitude: event.longitude ?? null,
    title: textsFrom(event.title),
    summary: textsFrom(event.summary),
    content: textsFrom(event.content),
  };
}

export type EventPayload = Pick<
  EventRow,
  | "type"
  | "start_at"
  | "end_at"
  | "slug"
  | "status"
  | "location"
  | "latitude"
  | "longitude"
  | "external_url"
  | "image_path"
  | "title"
  | "summary"
  | "content"
>;

export function eventFromForm(values: EventFormValues): EventPayload {
  return {
    type: values.type,
    start_at: fromBucharestInput(values.start),
    end_at: fromBucharestInput(values.end),
    slug: values.slug,
    status: values.status,
    location: values.location.trim() || null,
    external_url: values.external_url.trim() || null,
    image_path: values.image_path,
    // A point is stored only as a pair.
    latitude: values.latitude !== null && values.longitude !== null ? values.latitude : null,
    longitude: values.latitude !== null && values.longitude !== null ? values.longitude : null,
    title: textsTo(values.title) as I18nText,
    summary: textsTo(values.summary),
    content: textsTo(values.content),
  };
}

/** Which languages already have a title (shown as "translated / missing" on the tabs). */
export const translatedLanguages = (values: Pick<EventFormValues, "title">) =>
  LANGUAGES.filter((lng) => values.title[lng].trim() !== "");
