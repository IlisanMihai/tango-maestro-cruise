import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { rememberLanguage } from "@/i18n";
import { LANGUAGES, localizePath, splitLanguagePath } from "@/i18n/languages";

const LanguageSelector = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { language, path } = splitLanguagePath(location.pathname);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // scroll up → show, scroll down → hide
      setVisible(currentScrollY < lastScrollY || currentScrollY <= 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      aria-label={t("nav.language")}
      className={`fixed top-4 right-4 z-50 flex gap-1 bg-background/80 backdrop-blur-sm border border-gold/20 rounded-sm p-1 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
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
