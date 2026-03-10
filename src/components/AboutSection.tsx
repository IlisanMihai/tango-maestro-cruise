import maestroImage from "@/assets/maestro-portrait.jpg";

const AboutSection = () => {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          Maestrul invitat
        </p>
        <div className="separator-gold mb-16 max-w-[120px]" />

        <div className="relative md:flex md:items-start md:gap-8">
          {/* Portrait - full image visible */}
          <div className="md:w-[40%] shrink-0 mb-8 md:mb-0">
            <img
              src={maestroImage}
              alt="Portret Francisco Iturrieta - maestru de tango argentinian"
              className="w-full max-w-sm md:max-w-none object-contain rounded-sm"
            />
          </div>

          {/* Text block */}
          <div className="md:w-[65%] relative z-20 md:pt-16 md:pl-8 bg-background/90 md:backdrop-blur-sm md:p-12">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-8">
              Francisco Iturrieta
            </h2>
            <ul className="space-y-4 font-body text-base text-foreground/80 mb-10">
              <li className="flex items-start gap-3">
                <span className="block w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                Născut și format în Buenos Aires
              </li>
              <li className="flex items-start gap-3">
                <span className="block w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                Peste 20 de ani de experiență în predare și show-uri internaționale
              </li>
              <li className="flex items-start gap-3">
                <span className="block w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                Specializat în tango de salon, muzicalitate și improvizație
              </li>
            </ul>

            <blockquote className="border-l-2 border-gold/40 pl-6 py-2">
              <p className="font-display text-xl md:text-2xl italic text-parchment/90">
                „Tango este un dialog sincer între două inimi care ascultă aceeași muzică."
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
