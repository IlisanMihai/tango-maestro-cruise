export const LANGUAGES = ["ro", "en", "hu", "es", "sk"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Romanian lives at the root (/, /events); every other language gets a prefix (/en, /en/events). */
export const DEFAULT_LANGUAGE: Language = "ro";
/** localStorage key holding the language the visitor last picked. */
export const LANGUAGE_STORAGE_KEY = "lang";
export const SITE_URL = "https://oradeatango.ro";

/** BCP 47 locales used for date formatting. */
export const INTL_LOCALES: Record<Language, string> = {
  ro: "ro-RO",
  en: "en-GB",
  hu: "hu-HU",
  es: "es-ES",
  sk: "sk-SK",
};

export const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);

/** "/en/events" -> { language: "en", path: "/events" }; "/events" -> { language: "ro", path: "/events" }. */
export function splitLanguagePath(pathname: string): { language: Language; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (isLanguage(first) && first !== DEFAULT_LANGUAGE) {
    return { language: first, path: "/" + rest.join("/") };
  }
  return { language: DEFAULT_LANGUAGE, path: pathname || "/" };
}

/** Prefixes an unprefixed path ("/events") for the given language. */
export function localizePath(path: string, language: Language): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (language === DEFAULT_LANGUAGE) return clean;
  return clean === "/" ? `/${language}` : `/${language}${clean}`;
}
