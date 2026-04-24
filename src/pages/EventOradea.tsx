import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import Footer from "@/components/Footer";
import CarolinaRegistrationSection from "@/components/CarolinaRegistrationSection";
import { setPageMetadata } from "@/lib/utils";
import heroImage from "@/assets/hero-carolina.webp";
import heroImageMobile from "@/assets/hero-carolina-mobile.webp";

const EventOradea = () => {
  const { t } = useLanguage();

  useEffect(() => {
    setPageMetadata({
      title: "Tango weekend cu Carolina Jador în Oradea | Cursuri și Milonga",
      description: "Eveniment special cu Carolina Jador. Cursuri de tango, workshop-uri și milonga. Înscrie-te acum pentru această oportunitate unică!",
      image: "https://oradeatango.ro/og-event-image.webp",
      url: "https://oradeatango.ro/event",
      type: "website",
    });
  }, []);

  const events = [{ key: "event1" }, { key: "event2" }, { key: "event3" }];

  return (
    <main>
      <LanguageSelector />
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Mobile */}
        <picture className="absolute inset-0 w-full h-full block md:hidden">
          <source
            media="(max-width: 768px)"
            srcSet={heroImageMobile}
            type="image/webp"
          />
          <img
            src={heroImage}
            className="w-full h-full object-cover"
            alt="Tango cu Carolina Jador"
          />
        </picture>
        {/* Desktop */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-fixed bg-scroll hidden md:block"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="relative z-10 w-full max-w-content mx-auto px-6 pb-24 pt-32">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] text-parchment mb-4 whitespace-pre-line">
            {t("carolina.event.title")}
          </h1>
          <p className="font-display text-2xl md:text-3xl italic text-parchment/80 mb-4 max-w-xl">
            {t("carolina.event.subtitle")}
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            <a
              href="#eventreg"
              className="inline-block bg-primary text-primary-foreground px-8 py-3.5 font-body text-base md:text-sm font-medium tracking-wide rounded-sm hover:brightness-125 transition-all"
            >
              {t("hero.reg")}
            </a>
            <a
              href="#eventprogram"
              className="inline-block border border-gold/40 text-parchment px-8 py-3.5 font-body text-base md:text-sm font-medium tracking-wide rounded-sm hover:border-gold/70 transition-all"
            >
              {t("hero.schedule")}
            </a>
                        <a
              href="#eventprices"
              className="inline-block border border-gold/40 text-parchment px-8 py-3.5 font-body text-base md:text-sm font-medium tracking-wide rounded-sm hover:border-gold/70 transition-all"
            >
              {t("carolina.prices.packages")}
            </a>
          </div>
          <p className="font-body text-xs text-gold tracking-wide">
            {t("carolina.event.urgency")}
          </p>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-parchment mb-8">
            {t("about.event")} Carolina Elizabet Jador
          </h2>
          <h3 className="font-display text-xl font-semibold text-parchment mb-3">
            {t("carolina.event.about")}
          </h3>

          <div className="font-body text-base text-muted-foreground space-y-6 max-w-4xl whitespace-pre-line">
            <p>{t("carolina.event.intro")}</p>

            <div>
              <h3 className="font-display text-xl font-semibold text-parchment mb-3">
                {t("carolina.event.training.title")}
              </h3>
              <p>{t("carolina.event.training.text")}</p>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold text-parchment mb-3">
                {t("carolina.event.professional.title")}
              </h3>
              <p>{t("carolina.event.professional.text")}</p>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold text-parchment mb-3">
                {t("carolina.event.work.title")}
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>{t("carolina.event.work.dancer")}</li>
                <li>{t("carolina.event.work.choreographer")}</li>
                <li>{t("carolina.event.work.dj")}</li>
                <li>{t("carolina.event.work.organizer")}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold text-parchment mb-3">
                {t("carolina.event.international.title")}
              </h3>
              <p>{t("carolina.event.international.text")}</p>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold text-parchment mb-3">
                {t("carolina.event.cultural.title")}
              </h3>
              <p>{t("carolina.event.cultural.text")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="eventprogram" className="py-16 md:py-24 bg-secondary/50">
        <div className="max-w-content mx-auto px-6">
          <h2 className="font-display text-3xl md:text-5xl md:text-center font-semibold text-parchment mb-4">
            {t("carolina.program.title")}
          </h2>
          <p className="font-display text-xl md:text-2xl italic md:text-center text-gold mb-16 whitespace-pre-line">
            {t("carolina.program.subtitle")}
          </p>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gold/20" />

            <div className="space-y-10">
              {events.map((event, i) => (
                <div
                  key={event.key}
                  className={`relative flex flex-col md:flex-row items-start gap-8 ${
                    i % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-gold/40 -translate-x-1/2 mt-1" />
                  <div
                    className={`pl-12 md:pl-16 md:w-1/2 ${
                      i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                    }`}
                  >
                    <span className="font-body text-sm md:text-xs tracking-[0.2em] uppercase text-gold block mb-2">
                      {t(`carolina.program.${event.key}.date`)}
                    </span>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-parchment whitespace-pre-line">
                      {t(`carolina.program.${event.key}.title`)}
                    </h3>
                    <p className="font-body text-base md:text-sm text-foreground/70 leading-relaxed mb-3">
                      {t(`carolina.program.${event.key}.desc`)}
                    </p>
                    {i % 2 === 0 && (
                      <div className="relative">
                        <h3 className="font-display text-xl md:text-2xl font-semibold text-parchment whitespace-pre-line">
                          {t(`carolina.program.2${event.key}.title`)}
                        </h3>
                        <p className="font-body text-base md:text-sm text-foreground/70 leading-relaxed">
                          {t(`carolina.program.2${event.key}.desc`)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="eventprices" className="py-24 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-parchment mb-8">
            {t("carolina.prices.title")}
          </h2>

          <div className="mb-8">
            <p className="font-body text-base text-muted-foreground mb-2">
              <strong>{t("carolina.prices.location")}:</strong>{" "}
              {t("carolina.prices.address")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gold/40">
                  <th className="text-left px-4 py-3 font-display text-base md:text-lg font-semibold text-parchment">
                    {t("carolina.prices.packages")}
                  </th>
                  <th className="text-left px-4 py-3 font-display text-base md:text-lg font-semibold text-parchment">
                    {t("carolina.prices.earlyBird")}
                  </th>
                  <th className="text-left px-4 py-3 font-display text-base md:text-lg font-semibold text-parchment">
                    {t("carolina.prices.regularPrice")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gold/20 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-body text-sm md:text-base text-parchment font-medium">
                    {t("carolina.prices.fullPass")}
                  </td>
                  <td className="px-4 py-3 font-body text-sm md:text-base text-foreground/70">
                    {t("carolina.prices.fullPass.earlyBird")}
                  </td>
                  <td className="px-4 py-3 font-body text-sm md:text-base text-foreground/70">
                    {t("carolina.prices.fullPass.regular")}
                  </td>
                </tr>
                <tr className="border-b border-gold/20 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-body text-sm md:text-base text-parchment font-medium">
                    {t("carolina.prices.dayPass")}
                  </td>
                  <td className="px-4 py-3 font-body text-sm md:text-base text-foreground/70">
                    {t("carolina.prices.dayPass.earlyBird")}
                  </td>
                  <td className="px-4 py-3 font-body text-sm md:text-base text-foreground/70">
                    {t("carolina.prices.dayPass.regular")}
                  </td>
                </tr>
                <tr className="border-b border-gold/20 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-body text-sm md:text-base text-parchment font-medium">
                    {t("carolina.prices.milongaPass")}
                  </td>
                  <td className="px-4 py-3 font-body text-sm md:text-base text-foreground/70">
                    {t("carolina.prices.milongaPass.earlyBird")}
                  </td>
                  <td className="px-4 py-3 font-body text-sm md:text-base text-foreground/70">
                    {t("carolina.prices.milongaPass.regular")}
                  </td>
                </tr>
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-body text-sm md:text-base text-parchment font-medium">
                    {t("carolina.prices.workshop")}
                  </td>
                  <td className="px-4 py-3 font-body text-sm md:text-base text-foreground/70">
                    {t("carolina.prices.workshop.earlyBird")}
                  </td>
                  <td className="px-4 py-3 font-body text-sm md:text-base text-foreground/70">
                    {t("carolina.prices.workshop.regular")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mb-8">
            <p className="font-body text-sm text-gold tracking-wide">
              {t("carolina.prices.earlyBird.desc")}
            </p>
          </div>
        </div>
      </section>

      <CarolinaRegistrationSection />

      <Footer />
    </main>
  );
};

export default EventOradea;
