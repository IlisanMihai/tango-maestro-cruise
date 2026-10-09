import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";
import HeroSection from "@/components/HeroSection";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import CommunitySection from "@/components/CommunitySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { setPageMetadata } from "@/lib/utils";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";
import { SITE_URL } from "@/i18n/languages";

const Index = () => {
  const { t } = useTranslation();
  const localize = useLocalizedPath();

  useEffect(() => {
    setPageMetadata({
      title: t("meta.title"),
      description: t("meta.description"),
      image: `${SITE_URL}/og-image.jpg`,
      url: SITE_URL + localize("/"),
      type: "website",
    });
  }, [t, localize]);

  return (
    <main>
      <LanguageSelector />
      <HeroSection />
      <UpcomingEventsSection />
      <CommunitySection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
