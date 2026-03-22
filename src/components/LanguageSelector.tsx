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

  const langs: Language[] = ["ro", "en", "hu", "es"];

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-1 bg-background/80 backdrop-blur-sm border border-gold/20 rounded-sm p-1">
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
            <img src={flags[lang]} alt={lang} className="inline-block w-5 h-5 mr-1" />
            {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
