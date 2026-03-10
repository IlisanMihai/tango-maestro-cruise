const events = [
  {
    date: "Mai 2026",
    title: "Milonga de bun venit",
    description: "Seara de deschidere cu demonstrație de la maestru. Intrare liberă.",
  },
  {
    date: "Mai – Iulie",
    title: "Practici săptămânale",
    description: "Spațiu sigur pentru exercițiu, întrebări și feedback personalizat.",
  },
  {
    date: "Iulie 2026",
    title: "Gala de final",
    description: "Show special, invitați din alte orașe și o seară de neuitat.",
  },
];

const EventsSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          Dincolo de cursuri
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-16">
          Seri de tango în Oradea
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical gold line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gold/20" />

          <div className="space-y-16">
            {events.map((event, i) => (
              <div
                key={i}
                className={`relative flex flex-col md:flex-row items-start gap-8 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-gold/40 -translate-x-1/2 mt-1" />

                {/* Content */}
                <div className={`pl-12 md:pl-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-gold block mb-2">
                    {event.date}
                  </span>
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-parchment mb-3">
                    {event.title}
                  </h3>
                  <p className="font-body text-sm text-foreground/70 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
