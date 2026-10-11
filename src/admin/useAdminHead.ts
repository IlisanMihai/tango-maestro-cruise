import { useEffect } from "react";
import { useAdminT } from "./i18n";

/** Admin pages: page language and title, and never indexed by search engines. */
export function useAdminHead() {
  const { t, language } = useAdminT();
  const title = t("app.title");

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${title} | Tango Oradea`;
  }, [language, title]);

  useEffect(() => {
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
    return () => robots?.remove();
  }, []);
}
