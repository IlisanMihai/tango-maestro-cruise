import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "../auth";
import { FullPageSpinner } from "../AdminLayout";
import { useAdminHead } from "../useAdminHead";
import { setOwnPassword } from "../lib/api";

const inputClass =
  "w-full rounded-sm border border-gold/20 bg-secondary/50 px-4 py-3 font-body text-base text-foreground focus:border-primary focus:outline-none";

/** Supabase puts link errors in the URL hash, e.g. #error_code=otp_expired */
const linkError = () => new URLSearchParams(window.location.hash.slice(1)).get("error_code");

/**
 * Reached from an invitation or "forgot password" email (Supabase signs the
 * person in from the link), or by a signed-in user who wants a new password.
 */
const SetPasswordPage = () => {
  useAdminHead();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <FullPageSpinner />;

  if (!session) {
    const expired = linkError() === "otp_expired";
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center" role="alert">
          <h1 className="mb-3 font-display text-3xl text-parchment">Link expirat</h1>
          <p className="mb-6 font-body text-muted-foreground">
            {expired
              ? "Linkul din email a expirat sau a fost deja folosit."
              : "Pentru a seta parola, deschide linkul primit pe email."}{" "}
            Cere o invitație nouă de la un administrator sau folosește „Am uitat parola” la login.
          </p>
          <Link to="/admin/login" className="text-gold underline">
            Mergi la login
          </Link>
        </div>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Parola trebuie să aibă cel puțin 8 caractere.");
    if (password !== confirm) return setError("Cele două parole nu sunt la fel.");
    setBusy(true);
    try {
      await setOwnPassword(password);
      toast.success("Parola a fost salvată.");
      navigate("/admin", { replace: true });
    } catch (e) {
      setError(
        /different from the old/i.test((e as Error).message)
          ? "Alege o parolă diferită de cea veche."
          : "Parola nu a putut fi salvată. Încearcă din nou.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4" noValidate>
        <h1 className="font-display text-4xl text-parchment">Setează parola</h1>
        <p className="font-body text-sm text-muted-foreground">
          Pentru contul {session.user.email}. Cu ea te vei loga de acum în administrare.
        </p>
        <div>
          <label htmlFor="new-password" className="mb-1 block font-body text-sm text-foreground/80">
            Parolă nouă (minim 8 caractere)
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1 block font-body text-sm text-foreground/80">
            Repetă parola
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && (
          <p role="alert" className="font-body text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 font-body text-base font-medium text-primary-foreground hover:brightness-125 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}
          Salvează parola
        </button>
        <p className="text-center">
          <Link to="/admin" className="font-body text-sm text-muted-foreground hover:text-foreground">
            Înapoi la administrare
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SetPasswordPage;
