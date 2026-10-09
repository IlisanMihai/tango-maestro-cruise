import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-12 border-t border-gold/10">
      <div className="max-w-content mx-auto px-6 text-center">
        <p className="font-display text-lg text-parchment/60 mb-2">
          {t("footer.title")}
        </p>
        <p className="font-body text-xs text-muted-foreground">
          {t("footer.copy", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
