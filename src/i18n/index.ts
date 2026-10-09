import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import roCommon from "@/locales/ro/common.json";
import roLegacy from "@/locales/ro/legacy.json";
import enCommon from "@/locales/en/common.json";
import enLegacy from "@/locales/en/legacy.json";
import huCommon from "@/locales/hu/common.json";
import huLegacy from "@/locales/hu/legacy.json";
import esCommon from "@/locales/es/common.json";
import esLegacy from "@/locales/es/legacy.json";
import skCommon from "@/locales/sk/common.json";
import skLegacy from "@/locales/sk/legacy.json";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LANGUAGES,
  isLanguage,
  splitLanguagePath,
  type Language,
} from "./languages";

export const resources = {
  ro: { common: roCommon, legacy: roLegacy },
  en: { common: enCommon, legacy: enLegacy },
  hu: { common: huCommon, legacy: huLegacy },
  es: { common: esCommon, legacy: esLegacy },
  sk: { common: skCommon, legacy: skLegacy },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // The URL decides the language; the detector only suggests one on a first visit.
    lng: typeof window === "undefined" ? DEFAULT_LANGUAGE : splitLanguagePath(window.location.pathname).language,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGES,
    defaultNS: "common",
    ns: ["common", "legacy"],
    // Keys are flat ("home.hero.title1"), not nested objects.
    keySeparator: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: [],
    },
  });

const BOT_PATTERN = /bot|crawl|spider|slurp|lighthouse|headless|preview/i;

/**
 * Language to switch an unprefixed (Romanian) URL to on the first visit:
 * the visitor's saved choice, else their browser language. Null for crawlers,
 * so search engines always index the Romanian pages at their own URLs.
 */
export function preferredLanguage(): Language | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // storage blocked: fall through to browser detection
  }
  if (BOT_PATTERN.test(navigator.userAgent)) return null;
  const detected = i18n.services.languageDetector?.detect();
  const candidates = Array.isArray(detected) ? detected : detected ? [detected] : [];
  for (const code of candidates) {
    const base = code.toLowerCase().split("-")[0];
    if (isLanguage(base)) return base;
  }
  return null;
}

export function rememberLanguage(language: Language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // storage blocked: the URL still carries the language
  }
}

export default i18n;
