import heroImage from "@/assets/hero-tango.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Fixed-style parallax background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

      <div className="relative z-10 w-full max-w-content mx-auto px-6 pb-24 pt-48">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-6">
          Oradea · 2026
        </p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] text-parchment mb-8">
          Tango argentinian<br />
          la Oradea
        </h1>
        <p className="font-display text-xl md:text-2xl italic text-parchment/80 mb-4 max-w-lg">
          3 luni cu maestru din Buenos Aires
        </p>
        <p className="font-body text-base text-muted-foreground mb-10 max-w-md">
          Cursuri intensive, practici și milongi pentru toată comunitatea de tango din Oradea.
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <a
            href="#inscriere"
            className="inline-block bg-primary text-primary-foreground px-8 py-3.5 font-body text-sm font-medium tracking-wide rounded-sm hover:brightness-125 transition-all"
          >
            Înscrie-te la cursuri
          </a>
          <a
            href="#program"
            className="inline-block border border-gold/40 text-parchment px-8 py-3.5 font-body text-sm font-medium tracking-wide rounded-sm hover:border-gold/70 transition-all"
          >
            Programul complet
          </a>
        </div>

        <p className="font-body text-xs text-gold/70 tracking-wide">
          Locuri limitate – înscrieri până la 15 aprilie 2026
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
