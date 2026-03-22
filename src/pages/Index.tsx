import LanguageSelector from "@/components/LanguageSelector";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import BreathSection from "@/components/BreathSection";
import LevelsSection from "@/components/LevelsSection";
import ProgramSection from "@/components/ProgramSection";
import InfoSection from "@/components/InfoSection";
import EventsSection from "@/components/EventsSection";
import RegistrationSection from "@/components/RegistrationSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main>
      <LanguageSelector />
      <HeroSection />
      <AboutSection />
      <BreathSection />
      <LevelsSection />
      <ProgramSection />
      <InfoSection />
      <EventsSection />
      <RegistrationSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
};

export default Index;
