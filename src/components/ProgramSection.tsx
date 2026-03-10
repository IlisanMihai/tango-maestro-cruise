import { useLanguage } from "@/i18n/LanguageContext";

const ProgramSection = () => {
  const { t } = useLanguage();

  const months = [
    { key: "month1", num: 1 },
    { key: "month2", num: 2 },
    { key: "month3", num: 3 },
  ];

  return (
    <section id="program" className="py-24 md:py-32">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          {t("program.label")}
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-3">
          {t("program.title")}
        </h2>
        <p className="font-body text-muted-foreground mb-16">
          {t("program.subtitle")}
        </p>

        <div className="grid md:grid-cols-3 gap-px bg-gold/20">
          {months.map((month) => (
            <div key={month.key} className="bg-background p-8 md:p-10">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
                {t("program.month")} {month.num}
              </span>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-parchment mb-4">
                {t(`program.${month.key}.title`)}
              </h3>
              <p className="font-body text-sm text-foreground/70 mb-8 leading-relaxed">
                {t(`program.${month.key}.desc`)}
              </p>
              <div className="separator-gold mb-4" />
              <p className="font-body text-xs text-muted-foreground">
                {t("program.schedule")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;
