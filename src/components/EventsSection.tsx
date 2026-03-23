import { useLanguage } from "@/i18n/LanguageContext";

const EventsSection = () => {
  const { t } = useLanguage();

  const events = [
    { key: "event1" },
    { key: "event2" },
    { key: "event3" },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm md:text-center tracking-[0.3em] uppercase text-gold mb-4">
          {t("events.label")}
        </p>
        <h2 className="font-display text-3xl md:text-5xl md:text-center font-semibold text-parchment mb-16">
          {t("events.title")}
        </h2>

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gold/20" />

          <div className="space-y-16">
            {events.map((event, i) => (
              <div
                key={event.key}
                className={`relative flex flex-col md:flex-row items-start gap-8 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-gold/40 -translate-x-1/2 mt-1" />

                <div className={`pl-12 md:pl-16 md:w-1/2 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <span className="font-body text-sm md:text-xs tracking-[0.2em] uppercase text-gold block mb-2">
                    {t(`events.${event.key}.date`)}
                  </span>
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-parchment mb-3">
                    {t(`events.${event.key}.title`)}
                  </h3>
                  <p className="font-body text-base md:text-sm text-foreground/70 leading-relaxed">
                    {t(`events.${event.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
