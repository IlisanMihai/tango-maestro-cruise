import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

const RegistrationSection = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    level: "incepator",
    package: "3luni",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error(t("reg.errorMsg"));
      return;
    }
    toast.success(t("reg.successMsg"));
    setFormData({ name: "", email: "", phone: "", level: "incepator", package: "3luni" });
  };

  const inputClass =
    "w-full bg-secondary/50 border border-gold/15 rounded-sm px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40 transition-colors";
  const selectClass =
    "w-full bg-secondary/50 border border-gold/15 rounded-sm px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-gold/40 transition-colors appearance-none";

  return (
    <section id="inscriere" className="py-24 md:py-32 bg-secondary/30">
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
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className={selectClass}
            >
              <option value="incepator">{t("reg.beginner")}</option>
              <option value="intermediar">{t("reg.intermediate")}</option>
              <option value="avansat">{t("reg.advanced")}</option>
            </select>
            <select
              value={formData.package}
              onChange={(e) => setFormData({ ...formData, package: e.target.value })}
              className={selectClass}
            >
              <option value="3luni">{t("reg.pkg3")}</option>
              <option value="lunar">{t("reg.pkgMonthly")}</option>
              <option value="dropin">{t("reg.pkgDropin")}</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 font-body text-sm font-medium tracking-wide rounded-sm hover:brightness-125 transition-all"
          >
            {t("reg.submit")}
          </button>

          <p className="font-body text-xs text-muted-foreground text-center">
            {t("reg.note")}
          </p>
        </form>

        <div className="flex justify-center gap-8 mt-12">
          <a href="#" className="font-body text-xs tracking-wide text-gold/60 hover:text-gold transition-colors">
            Facebook
          </a>
          <a href="#" className="font-body text-xs tracking-wide text-gold/60 hover:text-gold transition-colors">
            Instagram
          </a>
          <a href="#" className="font-body text-xs tracking-wide text-gold/60 hover:text-gold transition-colors">
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;
