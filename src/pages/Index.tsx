import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import BreathSection from "@/components/BreathSection";
import ProgramSection from "@/components/ProgramSection";
import LevelsSection from "@/components/LevelsSection";
import EventsSection from "@/components/EventsSection";
import InfoSection from "@/components/InfoSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import RegistrationSection from "@/components/RegistrationSection";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  return (
    <main>
      <LanguageSelector />
      <HeroSection />
      <AboutSection />
      <BreathSection />
      <LevelsSection />
      <ProgramSection />
      <EventsSection />
      <InfoSection />
      <RegistrationSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
};

export default Index;
