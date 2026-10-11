import { setAdminLanguage, useAdminT, type AdminLanguage } from "../i18n";

/** RO / EN switch for the admin area (the public site has its own five languages). */
const AdminLanguageSwitch = () => {
  const { t, language } = useAdminT();
  return (
    <div role="group" aria-label={t("nav.language")} className="flex gap-0.5 rounded-sm border border-gold/20 p-0.5">
      {(["ro", "en"] as AdminLanguage[]).map((lng) => (
        <button
          key={lng}
          type="button"
          lang={lng}
          aria-pressed={language === lng}
          onClick={() => setAdminLanguage(lng)}
          className={`flex items-center gap-1 rounded-sm px-2 py-1 font-body text-xs transition-colors ${
            language === lng ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <img src={`/flags/${lng}.svg`} alt="" className="h-4 w-4" />
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default AdminLanguageSwitch;
