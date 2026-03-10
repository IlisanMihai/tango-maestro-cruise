const levels = [
  {
    label: "Începători absoluți",
    text: "Nu ai dansat niciodată tango? Începem de la zero, cu răbdare și bucurie.",
  },
  {
    label: "Intermediari",
    text: "Ai deja câteva luni sau ani de tango. Rafinăm tehnica și conexiunea.",
  },
  {
    label: "Avansați",
    text: "Lucrăm pe muzicalitate, improvizație și calitatea mișcării.",
  },
];

const LevelsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-content mx-auto px-6 text-center">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          Pentru fiecare nivel
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-16">
          Pentru cine sunt cursurile?
        </h2>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {levels.map((level, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-px bg-gold/40 mx-auto mb-6" />
              <h3 className="font-display text-xl md:text-2xl font-semibold text-parchment mb-4">
                {level.label}
              </h3>
              <p className="font-body text-sm text-foreground/70 leading-relaxed">
                {level.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LevelsSection;
