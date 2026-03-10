import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";

const flags: Record<Language, string> = {
  ro: "🇷🇴",
  en: "🇬🇧",
  es: "🇪🇸",
};

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const langs: Language[] = ["ro", "en", "es"];

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
          {flags[lang]} {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
