import { useLanguage } from "@/i18n/LanguageContext";

const ProgramSection = () => {
  const { t } = useLanguage();

  const months = [
    { key: "month1", num: 1 },
    { key: "month2", num: 2 },
    { key: "month3", num: 3 },
  ];

  return (
    <section id="program" className="py-16 md:py-20">
      <div className="max-w-content mx-auto px-6">
        <h2 className="font-display text-4xl md:text-5xl md:text-center font-semibold text-parchment mb-4">
          {t("program.title")}
        </h2>
        <p className="font-body text-xl text-muted-foreground md:text-center mb-6 md:mb-12">
          {t("program.subtitle")}
        </p>
        <div className="grid md:grid-cols-3 gap-px bg-gold/20">
          {months.map((month) => (
            <div key={month.key} className="bg-background p-8 md:p-10">
              <span className="font-body text-base md:text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
                {t("program.month")} {month.num}
              </span>
              <h3 className="font-display text-2xl font-semibold text-parchment mb-4">
                {t(`program.${month.key}.title`)}
              </h3>
              <p className="font-body text-base md:text-sm text-foreground/70 mb-4 md:mb-8 leading-relaxed">
                {t(`program.${month.key}.desc`)}
              </p>
              <div className="separator-gold mb-4" />
              <p className="font-body text-sm md:text-xs text-muted-foreground">
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
