import tangoDetail from "@/assets/tango-detail.jpg";

const BreathSection = () => {
  return (
    <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${tangoDetail})` }}
      />
      <div className="absolute inset-0 bg-background/50" />
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <p className="font-display text-2xl md:text-4xl italic text-parchment/80 text-center max-w-2xl">
          Fiecare pas este o conversație. Fiecare pauză, o promisiune.
        </p>
      </div>
    </section>
  );
};

export default BreathSection;
