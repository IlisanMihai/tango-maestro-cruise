import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotFound from "@/pages/NotFound";
import { preferredLanguage } from "./index";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  SITE_URL,
  isLanguage,
  localizePath,
  splitLanguagePath,
  type Language,
} from "./languages";

// The browser-language suggestion is applied once per page load, never after
// the visitor navigates or picks a language themselves.
let startupRedirectHandled = false;

function upsertLink(selector: string, attrs: Record<string, string>) {
  let link = document.head.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement("link");
    document.head.appendChild(link);
  }
  for (const [name, value] of Object.entries(attrs)) link.setAttribute(name, value);
}

/** Keeps <html lang>, canonical and hreflang alternates in sync with the URL. */
function useLanguageHead(language: Language, path: string) {
  useEffect(() => {
    document.documentElement.lang = language;
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: SITE_URL + localizePath(path, language) });
    for (const lng of LANGUAGES) {
      upsertLink(`link[rel="alternate"][hreflang="${lng}"]`, {
        rel: "alternate",
        hreflang: lng,
        href: SITE_URL + localizePath(path, lng),
      });
    }
    upsertLink('link[rel="alternate"][hreflang="x-default"]', {
      rel: "alternate",
      hreflang: "x-default",
      href: SITE_URL + localizePath(path, DEFAULT_LANGUAGE),
    });
  }, [language, path]);
}

/** Route element for "/:lng?": validates the prefix and drives i18next from the URL. */
const LanguageLayout = () => {
  const { lng } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const validPrefix = lng === undefined || (isLanguage(lng) && lng !== DEFAULT_LANGUAGE);
  const language: Language = validPrefix && lng ? (lng as Language) : DEFAULT_LANGUAGE;
  const { path } = splitLanguagePath(location.pathname);

  const [startupTarget] = useState(() => {
    if (startupRedirectHandled) return null;
    startupRedirectHandled = true;
    if (lng !== undefined) return null;
    const preferred = preferredLanguage();
    if (!preferred || preferred === DEFAULT_LANGUAGE) return null;
    return localizePath(location.pathname, preferred) + location.search + location.hash;
  });

  // Hide the Romanian page while switching, so it does not flash before the redirect.
  const [redirecting, setRedirecting] = useState(Boolean(startupTarget));

  // A passive effect (not a layout effect): the router only listens for
  // navigation once its own layout effects have run.
  // Runs once: `navigate` changes identity on every location change, so it must
  // not be a dependency (that would send the visitor back after each switch).
  useEffect(() => {
    if (!startupTarget) return;
    navigate(startupTarget, { replace: true });
    setRedirecting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch i18next before the page renders: components mounted in the same
  // commit as a language change would otherwise keep the old texts.
  // (Resources are bundled, so changeLanguage applies synchronously.)
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const languageReady = i18n.language === language;
  useLayoutEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
      rerender();
    }
  }, [i18n, language]);

  useLanguageHead(language, path);

  // "/ro/..." is the same page as "/...": keep a single URL per page.
  if (lng === DEFAULT_LANGUAGE) {
    const rest = location.pathname.replace(/^\/ro(?=\/|$)/, "") || "/";
    return <Navigate to={rest + location.search + location.hash} replace />;
  }
  if (redirecting || !languageReady) return null;
  if (!validPrefix) return <NotFound />;
  return <Outlet />;
};

export default LanguageLayout;
