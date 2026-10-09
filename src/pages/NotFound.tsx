import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const localize = useLocalizedPath();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-2 text-xl">{t("notFound.title")}</p>
        <p className="mb-6 text-muted-foreground">{t("notFound.text")}</p>
        <Link to={localize("/")} className="text-primary underline hover:text-primary/90">
          {t("notFound.back")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
