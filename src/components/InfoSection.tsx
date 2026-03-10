import { useLanguage } from "@/i18n/LanguageContext";

const InfoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          {t("info.label")}
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-16">
          {t("info.title")}
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-gold/20">
          <div className="bg-background p-8 md:p-10">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
              {t("info.location.label")}
            </span>
            <h3 className="font-display text-xl font-semibold text-parchment mb-4">
              {t("info.location.name")}
            </h3>
            <p className="font-body text-sm text-foreground/70 leading-relaxed whitespace-pre-line">
              {t("info.location.address")}
            </p>
          </div>

          <div className="bg-background p-8 md:p-10">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
              {t("info.calendar.label")}
            </span>
            <h3 className="font-display text-xl font-semibold text-parchment mb-4">
              {t("info.calendar.period")}
            </h3>
            <p className="font-body text-sm text-foreground/70 leading-relaxed whitespace-pre-line">
              {t("info.calendar.details")}
            </p>
          </div>

          <div className="bg-background p-8 md:p-10">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
              {t("info.pricing.label")}
            </span>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="font-body text-sm text-foreground/70">{t("info.pricing.3months")}</span>
                <span className="font-display text-xl text-parchment font-semibold">780 lei</span>
              </div>
              <div className="separator-gold" />
              <div className="flex justify-between items-baseline">
                <span className="font-body text-sm text-foreground/70">{t("info.pricing.monthly")}</span>
                <span className="font-display text-xl text-parchment font-semibold">280 lei</span>
              </div>
              <div className="separator-gold" />
              <div className="flex justify-between items-baseline">
                <span className="font-body text-sm text-foreground/70">{t("info.pricing.dropin")}</span>
                <span className="font-display text-xl text-parchment font-semibold">45 lei</span>
              </div>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              {t("info.pricing.note")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
