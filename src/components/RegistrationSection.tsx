import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import emailjs from "@emailjs/browser";
import ChevronDown from "@/components/ChevronDown";

const SHEETS_WEBHOOK = "https://script.google.com/macros/s/AKfycbw_Dh3IWnxqzl_zt_555tzXVlCBauciZTzecALjntfvb3YOm_QyMGLZ29DfQ-UF9eyC/exec";
const EMAILJS_PUBLIC_KEY    = "A1c6wF1oHPLirMlL1";
const EMAILJS_SERVICE_ID    = "service_098m15o";
const NOTIFICATION_TEMPLATE = "template_iu0mq8f";
const CONFIRMATION_TEMPLATES = {
  ro: "template_zauf10g",
  en: "template_xxxxxxx", // template-ul în engleză
  es: "template_xxxxxxx", // template-ul în spaniolă
  hu: "template_xxxxxxx", // template-ul în maghiară
};

const RegistrationSection = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    level: "",
    subscription: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error(t("reg.errorMsg"));
      return;
    }
    setIsLoading(true);
    try{
      // 1. Send new register notification email (EmailJS)
      await emailjs.send(EMAILJS_SERVICE_ID, NOTIFICATION_TEMPLATE, formData, EMAILJS_PUBLIC_KEY);
    
      // 2. Send confirmation email to user (EmailJS)
      await emailjs.send(EMAILJS_SERVICE_ID, CONFIRMATION_TEMPLATES[language], {
        full_name:    formData.name,
        to_email:     formData.email,
        level:        formData.level,
        subscription: formData.subscription,
      }, EMAILJS_PUBLIC_KEY);

      // 2. Send data to Google Sheets
      await fetch(SHEETS_WEBHOOK, {
        method: "POST",
        body: JSON.stringify(formData),
      });
    
      toast.success(t("reg.successMsg"));
      setFormData({ name: "", email: "", phone: "", level: "", subscription: "" });
    } catch (error) {
      toast.error(t("reg.submitError"));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-secondary/50 border border-gold/15 rounded-sm px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40 transition-colors";
  const selectClass =
    "w-full bg-secondary/50 border border-gold/15 rounded-sm px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-gold/40 transition-colors appearance-none";
  return (
    <section id="inscriere" className="py-24 md:py-32 bg-secondary/50">
      <div className="max-w-content mx-auto px-6">
        <div className="max-w-lg mx-auto text-center mb-16">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-4">
            {t("reg.label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-parchment mb-4">
            {t("reg.title")}
          </h2>
          <div className="separator-gold mx-auto max-w-[80px]" />
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
          <input
            type="text"
            placeholder={t("reg.name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
            maxLength={100}
          />
          <input
            type="email"
            placeholder={t("reg.email")}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
            maxLength={255}
          />
          <input
            type="tel"
            placeholder={t("reg.phone")}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={inputClass}
            maxLength={20}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className={selectClass}
              required
            >
              <option value="" disabled>{t("reg.selectLevel")}</option>
              <option value="incepator">{t("reg.beginner")}</option>
              <option value="intermediar">{t("reg.intermediate")}</option>
              <option value="avansat">{t("reg.advanced")}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            </div>
            <div className="relative">
            <select
              value={formData.subscription}
              onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
              className={selectClass}
              required
            >
              <option value="" disabled>{t("reg.selectPackage")}</option>
              <option value="3 luni">{t("reg.pkgFull")}</option>
              <option value="lunar">{t("reg.pkgMonthly")}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-4 font-body text-sm font-medium tracking-wide rounded-sm hover:brightness-125 transition-all"
          >
            {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {t("reg.loading")}
            </span>
            ) : ( t("reg.submit"))}
          </button>

          <p className="font-body text-xs text-muted-foreground text-center">
            {t("reg.note")}
          </p>
          <p className="font-body text-xs text-muted-foreground text-center">
            {t("reg.contact")} <a href="mailto:oradeatango@gmail.com" className="font-body text-xs tracking-wide text-gold/80 hover:text-gold transition-colors">
              oradeatango@gmail.com
            </a>
            {t("reg.contact2")} <a href="https://www.facebook.com/events/26660535083543880?active_tab=about" className="font-body text-xs tracking-wide text-gold/80 hover:text-gold transition-colors">
            Facebook
            </a>
          </p>
        </form>
      </div>
    </section>
  );
};

export default RegistrationSection;
