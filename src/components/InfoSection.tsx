import { useLanguage } from "@/i18n/LanguageContext";

const InfoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-24 bg-secondary/50">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          {t("info.label")}
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-12">
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
              <div>
                <div className="flex justify-between items-baseline">
                <span className="font-body text-sm text-foreground/70">{t("info.pricing.3months")}</span>
                <span className="font-display text-xl text-parchment font-semibold">864 lei</span>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {t("info.pricing.3months.details")}
                </p>
              </div>  
              <div className="separator-gold" />
              <div>
                <div className="flex justify-between items-baseline">
                  <span className="font-body text-sm text-foreground/70">{t("info.pricing.monthly")}</span>
                  <span className="font-display text-xl text-parchment font-semibold">320 lei</span>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {t("info.pricing.monthly.details")}
                </p>
              </div>
              <div className="separator-gold" />
              <div>
                <div className="flex justify-between items-baseline">
                  <span className="font-body text-sm text-foreground/70">{t("info.pricing.dropin")}</span>
                  <span className="font-display text-xl text-parchment font-semibold">50 lei</span>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {t("info.pricing.dropin.details")}
                </p>
              </div>
            </div>
            <p className="font-body text-xs text-muted-foreground mb-2">
              {t("info.pricing.note")}
            </p>
            <p className="font-body text-xs italic text-gold block">
              {t("info.pricing.discount")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
