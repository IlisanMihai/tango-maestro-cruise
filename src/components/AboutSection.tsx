import maestroImage from "@/assets/maestro-portrait.jpeg";
import { useLanguage } from "@/i18n/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          {t("about.label")}
        </p>
        <div className="separator-gold mb-16 max-w-[120px]" />

        <div className="relative md:flex md:items-start md:gap-8">
          <div className="md:w-[40%] shrink-0 mb-8 md:mb-0">
            <img
              src={maestroImage}
              alt={`${t("about.name")} - maestro de tango argentinian`}
              className="w-full max-w-sm md:max-w-none object-contain rounded-sm"
            />
          </div>

          <div className="md:w-[60%] md:pt-4">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-8">
              {t("about.name")}
            </h2>
            <ul className="space-y-4 font-body text-base text-foreground/80 mb-10">
              {["about.bio1", "about.bio2", "about.bio3"].map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="block w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                  {t(key)}
                </li>
              ))}
            </ul>

            <blockquote className="border-l-2 border-gold/40 pl-6 py-2">
              <p className="font-display text-xl md:text-2xl italic text-parchment/90">
                {t("about.quote")}
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
