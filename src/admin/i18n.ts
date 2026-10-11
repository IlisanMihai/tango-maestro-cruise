import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import roAdmin from "@/locales/ro/admin.json";
import enAdmin from "@/locales/en/admin.json";

// The admin texts are loaded only with the admin code (not on the public site).
i18n.addResourceBundle("ro", "admin", roAdmin, true, true);
i18n.addResourceBundle("en", "admin", enAdmin, true, true);

/** The admin area is in Romanian or English, independent of the public site's language. */
export type AdminLanguage = "ro" | "en";

const STORAGE_KEY = "admin-lang";

export function storedAdminLanguage(): AdminLanguage {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ro";
  } catch {
    return "ro";
  }
}

/** Applies the saved admin language (called when the admin area opens). */
export function applyAdminLanguage() {
  const language = storedAdminLanguage();
  if (i18n.language !== language) i18n.changeLanguage(language);
}

export function setAdminLanguage(language: AdminLanguage) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // storage blocked: still switch for this visit
  }
  i18n.changeLanguage(language);
}

/** t() for admin texts, plus the current admin language. */
export function useAdminT() {
  const { t, i18n: instance } = useTranslation("admin");
  const language: AdminLanguage = instance.language === "en" ? "en" : "ro";
  return { t, language };
}
