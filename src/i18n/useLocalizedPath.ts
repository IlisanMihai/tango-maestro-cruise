import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { isLanguage, localizePath, DEFAULT_LANGUAGE } from "./languages";

/** Returns a function turning "/events" into "/en/events" for the current language. */
export function useLocalizedPath() {
  const { i18n } = useTranslation();
  const language = isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
  return useCallback((path: string) => localizePath(path, language), [language]);
}
