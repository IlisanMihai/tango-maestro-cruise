import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../auth";
import { FullPageSpinner } from "../AdminLayout";
import { useAdminHead } from "../useAdminHead";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
import { sendPasswordReset } from "../lib/api";

// Google login appears only once it is set up in Supabase (VITE_GOOGLE_LOGIN=true).
const GOOGLE_LOGIN = import.meta.env.VITE_GOOGLE_LOGIN === "true";

const inputClass =
  "w-full rounded-sm border border-gold/20 bg-secondary/50 px-4 py-3 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

function friendlyError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Email sau parolă greșită.";
  if (/email not confirmed/i.test(message)) return "Adresa de email nu a fost confirmată încă.";
  if (/provider is not enabled|unsupported provider/i.test(message)) return "Login-ul cu Google nu este încă activat.";
  if (/signups not allowed|user not found/i.test(message))
    return "Acest cont nu are acces. Conturile se creează doar prin invitație.";
  return "Nu te-am putut autentifica. Încearcă din nou.";
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12S6.6 21.8 12 21.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" />
  </svg>
);

const LoginPage = () => {
  useAdminHead();
  const { session, profile, loading, signInWithPassword, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"password" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent">("idle");

  if (loading) return <FullPageSpinner />;
  if (session && profile?.active) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from?.startsWith("/admin") ? from : "/admin"} replace />;
  }
  if (session) return <Navigate to="/admin" replace />; // shows the "inactive account" message

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy("password");
    try {
      await signInWithPassword(email.trim(), password);
    } catch (e) {
      setError(friendlyError((e as Error).message));
    } finally {
      setBusy(null);
    }
  };

  const google = async () => {
    setError(null);
    setBusy("google");
    try {
      await signInWithGoogle(); // leaves the page on success
    } catch (e) {
      setError(friendlyError((e as Error).message));
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 font-display text-4xl text-parchment">Administrare</h1>
        <p className="mb-8 font-body text-sm text-muted-foreground">
          Intră în cont ca să adaugi și să modifici evenimente.
        </p>

        {!isSupabaseConfigured && (
          <p role="alert" className="mb-6 rounded-sm border border-destructive/50 p-3 font-body text-sm text-destructive">
            Lipsesc VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
          </p>
        )}

        {GOOGLE_LOGIN && (
          <>
            <button
              type="button"
              onClick={google}
              disabled={busy !== null}
              className="flex w-full items-center justify-center gap-3 rounded-sm bg-parchment px-4 py-3 font-body text-base font-medium text-background hover:brightness-95 disabled:opacity-60"
            >
              {busy === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              Continuă cu Google
            </button>

            <div className="my-6 flex items-center gap-3 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px flex-1 bg-gold/20" />
              sau
              <span className="h-px flex-1 bg-gold/20" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block font-body text-sm text-foreground/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block font-body text-sm text-foreground/80">
              Parolă
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            disabled={busy !== null}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 font-body text-base font-medium text-primary-foreground hover:brightness-125 disabled:opacity-60"
          >
            {busy === "password" && <Loader2 className="h-5 w-5 animate-spin" />}
            Intră în cont
          </button>
        </form>

        <div className="mt-4 text-center">
          {resetState === "sent" ? (
            <p role="status" className="font-body text-sm text-muted-foreground">
              Dacă adresa are cont, vei primi în câteva minute un email cu un link pentru o parolă nouă.
            </p>
          ) : (
            <button
              type="button"
              disabled={resetState === "sending"}
              onClick={async () => {
                setError(null);
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                  setError("Scrie mai întâi adresa de email, apoi apasă „Am uitat parola”.");
                  return;
                }
                setResetState("sending");
                try {
                  await sendPasswordReset(email.trim());
                } catch {
                  // Same answer either way: do not reveal which emails have accounts.
                }
                setResetState("sent");
              }}
              className="font-body text-sm text-gold underline-offset-4 hover:underline disabled:opacity-60"
            >
              Am uitat parola
            </button>
          )}
        </div>

        <p className="mt-8 font-body text-xs text-muted-foreground">
          Conturile se creează doar prin invitație de la un administrator.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
