const testimonials = [
  {
    text: "Am venit fără nicio experiență și am plecat cu o pasiune nouă. Atmosfera este caldă, iar maestrul are un dar unic de a te face să simți muzica.",
    name: "Ana M.",
    level: "Începătoare",
  },
  {
    text: "După 3 ani de tango, credeam că știu totul. Acest curs mi-a deschis ochii asupra muzicalității și a calității mișcării.",
    name: "Radu P.",
    level: "Avansat",
  },
  {
    text: "Practicile săptămânale sunt locul unde am învățat cel mai mult. Feedback-ul direct de la maestru face toată diferența.",
    name: "Elena T.",
    level: "Intermediară",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          Comunitate
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-16">
          Ce spun dansatorii din Oradea
        </h2>

        <div className="space-y-12">
          {testimonials.map((t, i) => (
            <div key={i} className="border-l-2 border-gold/30 pl-8 py-2 max-w-2xl">
              <p className="font-display text-lg md:text-xl italic text-parchment/85 mb-4 leading-relaxed">
                „{t.text}"
              </p>
              <p className="font-body text-sm text-muted-foreground">
                {t.name} · <span className="text-gold/70">{t.level}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
