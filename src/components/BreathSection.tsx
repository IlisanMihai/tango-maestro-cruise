import { useLanguage } from "@/i18n/LanguageContext";
import tangoDetail from "@/assets/tango-detail.jpg";
import tangoDetailDesktop from "@/assets/tango-detail.webp";
import tangoDetailMobile from "@/assets/tango-detail-mobile.webp";

const BreathSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
      {/* Mobile - picture*/}
      <picture className="absolute inset-0 w-full h-full block md:hidden">
        <source media="(max-width: 768px)" srcSet={tangoDetailMobile} type="image/webp"/>
        <img src={tangoDetail} className="w-full h-full object-cover" alt="Tango shoes" />
      </picture>
      {/* Desktop - with parallax */}
      <div className="absolute inset-0 bg-cover bg-center bg-fixed hidden md:block"
        style={{ backgroundImage: `url(${tangoDetailDesktop})` }}/>
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
