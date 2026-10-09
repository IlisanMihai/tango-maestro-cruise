import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { rememberLanguage } from "@/i18n";
import { useShowOnScrollUp } from "@/hooks/use-hide-on-scroll";
import { LANGUAGES, localizePath, splitLanguagePath } from "@/i18n/languages";

/**
 * Flag links that switch the URL to another language.
 * floating: fixed in the top-right corner, hidden while scrolling down (homepage);
 * otherwise rendered in place, e.g. in a page header.
 */
const LanguageSelector = ({ floating = true }: { floating?: boolean }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { language, path } = splitLanguagePath(location.pathname);
  const visible = useShowOnScrollUp(floating);

  return (
    <nav
      aria-label={t("nav.language")}
      className={`flex gap-1 bg-background/80 backdrop-blur-sm border border-gold/20 rounded-sm p-1 ${
        floating
          ? `fixed top-4 right-4 z-50 transition-all duration-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
            }`
          : ""
      }`}
    >
      {LANGUAGES.map((lang) => (
        <Link
          key={lang}
          to={localizePath(path, lang) + location.search + location.hash}
          hrefLang={lang}
          lang={lang}
          aria-current={language === lang ? "true" : undefined}
          onClick={() => rememberLanguage(lang)}
          className={`flex items-center px-1.5 sm:px-2.5 py-1.5 text-sm font-body rounded-sm transition-all ${
            language === lang
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <img src={`/flags/${lang}.svg`} alt="" className="inline-block w-5 h-5 mr-1" />
          {lang.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
};

export default LanguageSelector;
