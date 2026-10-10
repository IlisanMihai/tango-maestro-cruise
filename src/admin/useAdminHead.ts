import { useEffect } from "react";

/** Admin pages are Romanian-only and must not be indexed. */
export function useAdminHead() {
  useEffect(() => {
    document.documentElement.lang = "ro";
    document.title = "Administrare | Tango Oradea";
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
