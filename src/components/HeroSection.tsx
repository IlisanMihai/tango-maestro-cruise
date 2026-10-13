import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-tango.jpg";
import heroImageDesktop from "@/assets/hero-desktop.webp";
import heroImageMobile from "@/assets/hero-mobile.webp";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden">
      {/* Mobile */}
      <picture className="absolute inset-0 w-full h-full block md:hidden">
        <source media="(max-width: 768px)" srcSet={heroImageMobile} type="image/webp" />
        <img src={heroImage} className="w-full h-full object-cover" alt="" />
      </picture>
      {/* Desktop */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-fixed bg-scroll hidden md:block"
        style={{ backgroundImage: `url(${heroImageDesktop})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      <div className="relative z-10 w-full max-w-content mx-auto px-6 pb-16 md:pb-16 pt-32">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] text-parchment mb-4">
          {t("home.hero.title1")}
          <br />
          {t("home.hero.title2")}
        </h1>
        <p className="font-display text-2xl md:text-3xl italic text-parchment/80 mb-8 max-w-xl">
          {t("home.hero.subtitle")}
        </p>
        <p className="font-body text-base text-muted-foreground max-w-md">
          {t("home.hero.description")}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
