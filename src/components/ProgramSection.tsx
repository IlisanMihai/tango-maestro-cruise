const months = [
  {
    title: "Luna 1 – Fundament și conexiune",
    description: "Poziție, caminată, abrazo, conexiune și ritm de bază. Construim fundația pe care se clădește fiecare pas.",
    schedule: "Luni & Miercuri, 19:00–21:00",
  },
  {
    title: "Luna 2 – Muzicalitate și improvizație",
    description: "Pași combinați, joc cu ritmul, introducere în vals și milonga. Începem să ascultăm muzica cu tot corpul.",
    schedule: "Luni & Miercuri, 19:00–21:00",
  },
  {
    title: "Luna 3 – Eleganță și expresie",
    description: "Giros, sacadas, secvențe pentru milongă și finețe în mișcare. Rafinăm și pregătim dansul pentru scenă.",
    schedule: "Marți & Joi, 19:00–21:00",
  },
];

const ProgramSection = () => {
  return (
    <section id="program" className="py-24 md:py-32">
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
          Programul în Oradea
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-3">
          Structurat pe 3 luni
        </h2>
        <p className="font-body text-muted-foreground mb-16">
          Pentru toate nivelurile.
        </p>

        <div className="grid md:grid-cols-3 gap-px bg-gold/20">
          {months.map((month, i) => (
            <div key={i} className="bg-background p-8 md:p-10">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-6 block">
                Luna {i + 1}
              </span>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-parchment mb-4">
                {month.title.split(" – ")[1]}
              </h3>
              <p className="font-body text-sm text-foreground/70 mb-8 leading-relaxed">
                {month.description}
              </p>
              <div className="separator-gold mb-4" />
              <p className="font-body text-xs text-muted-foreground">
                {month.schedule}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;
