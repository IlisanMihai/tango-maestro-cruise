import tangoDetail from "@/assets/tango-detail.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

const BreathSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-fixed bg-scroll"
        style={{ backgroundImage: `url(${tangoDetail})` }}
      />
      <div className="absolute inset-0 bg-background/50" />
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <p className="font-display text-3xl md:text-5xl italic text-parchment/80 text-center max-w-2xl whitespace-pre-line">
          {t("breath.quote")}
        </p>
      </div>
    </section>
  );
};

export default BreathSection;
