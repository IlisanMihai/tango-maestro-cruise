import { useLanguage } from "@/i18n/LanguageContext";

const TestimonialsSection = () => {
  const { t } = useLanguage();

  const testimonials = [
    { key: "t1" },
    { key: "t2" },
    { key: "t3" },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          {t("testimonials.label")}
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-16">
          {t("testimonials.title")}
        </h2>

        <div className="space-y-12">
          {testimonials.map((item) => (
            <div key={item.key} className="border-l-2 border-gold/30 pl-8 py-2 max-w-2xl">
              <p className="font-display text-xl md:text-xl italic text-parchment/85 mb-4 leading-relaxed">
                &bdquo;{t(`testimonials.${item.key}.text`)}&rdquo;
              </p>
              <p className="font-body text-sm text-muted-foreground">
                {t(`testimonials.${item.key}.name`)} · <span className="text-gold/70">{t(`testimonials.${item.key}.level`)}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
