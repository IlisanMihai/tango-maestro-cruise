import { useTranslation } from "react-i18next";

const CommunitySection = () => {
  const { t } = useTranslation();

  return (
    <section id="community" className="py-16 md:py-24 bg-secondary/50">
      <div className="max-w-content mx-auto px-6">
        <div className="max-w-2xl md:mx-auto md:text-center">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
            {t("home.community.label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-6">
            {t("home.community.title")}
          </h2>
          <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
            {t("home.community.text")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
