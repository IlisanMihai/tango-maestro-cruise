const InfoSection = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          Detalii practice
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-16">
          Loc, calendar, contribuție
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-gold/20">
          {/* Location */}
          <div className="bg-background p-8 md:p-10">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
              Locație
            </span>
            <h3 className="font-display text-xl font-semibold text-parchment mb-4">
              Sala de dans Oradea
            </h3>
            <p className="font-body text-sm text-foreground/70 leading-relaxed">
              Piața Emanuil Gojdu nr. 45<br />
              Oradea, Bihor
            </p>
          </div>

          {/* Calendar */}
          <div className="bg-background p-8 md:p-10">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
              Calendar
            </span>
            <h3 className="font-display text-xl font-semibold text-parchment mb-4">
              3 Aprilie – 28 Iunie 2026
            </h3>
            <p className="font-body text-sm text-foreground/70 leading-relaxed">
              Marți & Joi<br />
              19:00 – 21:00<br />
              + milongi în weekenduri
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-background p-8 md:p-10">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
              Contribuție
            </span>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="font-body text-sm text-foreground/70">Pachet 3 luni</span>
                <span className="font-display text-xl text-parchment font-semibold">450 lei</span>
              </div>
              <div className="separator-gold" />
              <div className="flex justify-between items-baseline">
                <span className="font-body text-sm text-foreground/70">Pachet lunar</span>
                <span className="font-display text-xl text-parchment font-semibold">180 lei</span>
              </div>
              <div className="separator-gold" />
              <div className="flex justify-between items-baseline">
                <span className="font-body text-sm text-foreground/70">Drop-in</span>
                <span className="font-display text-xl text-parchment font-semibold">50 lei</span>
              </div>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              Include cursuri + practici + reduceri la milongi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
