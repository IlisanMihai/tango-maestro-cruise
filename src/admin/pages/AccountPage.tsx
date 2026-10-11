import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "../auth";
import { setMyName } from "../lib/api";
import { useAdminT } from "../i18n";

const inputClass =
  "w-full rounded-sm border border-gold/20 bg-secondary/50 px-3 py-2.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

/** "My account": everyone can change their own name and password. */
const AccountPage = () => {
  const { t } = useAdminT();
  const { profile, session, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => setName(profile?.name ?? ""), [profile?.name]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await setMyName(name.trim());
      await refreshProfile();
      toast.success(t("account.nameSaved"));
    } catch {
      toast.error(t("account.nameFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-parchment md:text-4xl">{t("account.title")}</h1>
        <p className="font-body text-sm text-muted-foreground">
          {session?.user.email} · {profile?.role === "admin" ? t("users.roleAdmin") : t("users.roleEditor")}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3" noValidate>
        <label htmlFor="my-name" className="block font-body text-sm text-foreground/80">
          {t("account.yourName")}
        </label>
        <input
          id="my-name"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("account.namePlaceholder")}
          className={inputClass}
        />
        <p className="font-body text-xs text-muted-foreground">
          {t("account.nameHint")}
        </p>
        <button
          type="submit"
          disabled={busy || name.trim() === (profile?.name ?? "")}
          className="flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-body text-sm font-medium text-primary-foreground hover:brightness-125 disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("account.saveName")}
        </button>
      </form>

      <section className="space-y-3 border-t border-gold/10 pt-6">
        <h2 className="font-display text-xl text-parchment">{t("account.password")}</h2>
        <Link
          to="/admin/set-password"
          className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-5 py-3 font-body text-sm text-parchment hover:border-gold/70"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          {t("account.changePassword")}
        </Link>
      </section>
    </div>
  );
};

export default AccountPage;
