import { useTranslation } from "react-i18next";

const testimonials = ["t1", "t2", "t3"] as const;

const TestimonialsSection = () => {
  const { t } = useTranslation();

  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          {t("testimonials.label")}
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-10 md:mb-16">
          {t("testimonials.title")}
        </h2>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          {testimonials.map((key) => (
            <figure key={key} className="border-l-2 border-gold/30 pl-6 md:pl-8 py-2 max-w-2xl">
              <blockquote className="font-display text-lg md:text-xl italic text-parchment/85 mb-4 leading-relaxed">
                &bdquo;{t(`testimonials.${key}.text` as const)}&rdquo;
              </blockquote>
              <figcaption className="font-body text-sm text-muted-foreground">
                {t(`testimonials.${key}.name` as const)} ·{" "}
                <span className="text-gold">{t(`testimonials.${key}.level` as const)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
