import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";

const flags: Record<Language, string> = {
  ro: "/flags/ro.svg",
  en: "/flags/en.svg",
  hu: "/flags/hu.svg",
  es: "/flags/es.svg",
};

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY) {
        setVisible(true);  // scroll în sus → apare
      } else {
        setVisible(false); // scroll în jos → dispare
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const langs: Language[] = ["ro", "en", "hu", "es"];

  return (
    <div className={`fixed top-4 right-4 z-50 flex gap-1 bg-background/80 backdrop-blur-sm border border-gold/20 rounded-sm p-1 transition-all duration-300 ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
    }`}>
      {langs.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-2.5 py-1.5 text-sm font-body rounded-sm transition-all ${
            language === lang
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <img src={flags[lang]} alt={`${lang} flag`} className="inline-block w-5 h-5 mr-1" />
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;