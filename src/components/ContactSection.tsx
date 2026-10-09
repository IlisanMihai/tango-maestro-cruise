import { useTranslation } from "react-i18next";

const CONTACT_EMAIL = "oradeatango@gmail.com";
const FACEBOOK_GROUP = "https://www.facebook.com/groups/1590478104903180/";

const ContactSection = () => {
  const { t } = useTranslation();

  return (
    <section id="contact" className="pb-16 md:pb-24">
      <div className="max-w-content mx-auto px-6 md:text-center">
        <p className="font-body text-sm text-muted-foreground">
          {t("home.community.contact")}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold hover:text-gold/80 transition-colors">
            {CONTACT_EMAIL}
          </a>
          {" · "}
          <a
            href={FACEBOOK_GROUP}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold/80 transition-colors"
          >
            {t("home.community.facebook")}
          </a>
        </p>
      </div>
    </section>
  );
};

export default ContactSection;
