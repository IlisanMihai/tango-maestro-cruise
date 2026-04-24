import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-tango.jpg";
import heroImageDesktop from "@/assets/hero-desktop.webp";
import heroImageMobile from "@/assets/hero-mobile.webp";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Mobile */}
      <picture className="absolute inset-0 w-full h-full block md:hidden">
        <source media="(max-width: 768px)" srcSet={heroImageMobile} type="image/webp"/>
        <img src={heroImage} className="w-full h-full object-cover" alt="Tango argentinian in Oradea" />
      </picture>
      {/* Desktop */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-fixed bg-scroll hidden md:block"
        style={{ backgroundImage: `url(${heroImageDesktop})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      <div className="relative z-10 w-full max-w-content mx-auto px-6 pb-24 pt-32">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] text-parchment mb-4">
          {t("hero.title1")}<br />
          {t("hero.title2")}
        </h1>
        <p className="font-display text-2xl md:text-3xl italic text-parchment/80 mb-4 max-w-xl">
          {t("hero.subtitle")}
        </p>
        <p className="font-body text-base text-muted-foreground mb-6 max-w-md">
          {t("hero.description")}
        </p>
        <p className="font-body text-base font-semibold italic text-gold mb-4 max-w-md">
          {t("hero.invitation")}
        </p>

        <div className="flex flex-wrap gap-4 mb-4">
          <a
            href="#inscriere"
            className="inline-block bg-primary text-primary-foreground px-8 py-3.5 font-body text-base md:text-sm font-medium tracking-wide rounded-sm hover:brightness-125 transition-all"
          >
            {t("hero.reg")}
          </a>
          <a
            href="#program"
            className="inline-block border border-gold/40 text-parchment px-8 py-3.5 font-body text-base md:text-sm font-medium tracking-wide rounded-sm hover:border-gold/70 transition-all"
          >
            {t("hero.schedule")}
          </a>
          <Link
            to="/event"
            className="inline-block bg-accent text-accent-foreground px-8 py-3.5 font-body text-base md:text-sm font-medium tracking-wide rounded-sm hover:brightness-125 transition-all"
          >
            Special Event
          </Link>
        </div>

        <p className="font-body text-xs text-gold tracking-wide">
          {t("hero.urgency")}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
