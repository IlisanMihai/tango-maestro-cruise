import heroImage from "@/assets/hero-tango.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

      <div className="relative z-10 w-full max-w-content mx-auto px-6 pb-24 pt-48">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] text-parchment mb-8">
          {t("hero.title1")}<br />
          {t("hero.title2")}
        </h1>
        <p className="font-display text-xl md:text-2xl italic text-parchment/80 mb-4 max-w-lg">
          {t("hero.subtitle")}
        </p>
        <p className="font-body text-base text-muted-foreground mb-10 max-w-md">
          {t("hero.description")}
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <a
            href="#inscriere"
            className="inline-block bg-primary text-primary-foreground px-8 py-3.5 font-body text-sm font-medium tracking-wide rounded-sm hover:brightness-125 transition-all"
          >
            {t("hero.cta")}
          </a>
          <a
            href="#program"
            className="inline-block border border-gold/40 text-parchment px-8 py-3.5 font-body text-sm font-medium tracking-wide rounded-sm hover:border-gold/70 transition-all"
          >
            {t("hero.schedule")}
          </a>
        </div>

        <p className="font-body text-xs text-gold/70 tracking-wide">
          {t("hero.urgency")}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
