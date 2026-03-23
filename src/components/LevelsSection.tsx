import { useLanguage } from "@/i18n/LanguageContext";

const LevelsSection = () => {
  const { t } = useLanguage();

  const levels = [
    { key: "beginner" },
    { key: "intermediate" },
    { key: "advanced" },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="max-w-content mx-auto px-6 text-center">
        
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-8 md:mb-12">
          {t("levels.title")}
        </h2>
        
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-10 whitespace-pre-line">
          {t("levels.subtitle")}
        </p>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {levels.map((level) => (
            <div key={level.key} className="text-center">
              <div className="w-12 h-px bg-gold/40 mx-auto mb-4" />
              <h3 className="font-display text-2xl font-semibold text-parchment mb-4">
                {t(`levels.${level.key}`)}
              </h3>
              <p className="font-body text-base md:text-sm text-foreground/70 leading-relaxed">
                {t(`levels.${level.key}.text`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LevelsSection;
