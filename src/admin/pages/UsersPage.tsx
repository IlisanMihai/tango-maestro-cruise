import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, UserPlus } from "lucide-react";
import { useAuth } from "../auth";
import {
  InviteError,
  LastAdminError,
  fetchStaff,
  inviteStaff,
  updateStaff,
  type InviteRequest,
  type StaffMember,
  type StaffRole,
} from "../lib/api";

const inputClass =
  "w-full rounded-sm border border-gold/20 bg-secondary/50 px-3 py-2.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const ROLE_LABELS: Record<StaffRole, string> = { editor: "Editor", admin: "Administrator" };

function inviteErrorMessage(error: unknown): string {
  if (!(error instanceof InviteError)) return "Contul nu a putut fi creat. Încearcă din nou.";
  switch (error.code) {
    case "bad_email":
      return "Adresa de email nu pare corectă.";
    case "weak_password":
      return "Parola trebuie să aibă cel puțin 8 caractere.";
    case "not_admin":
      return "Doar un administrator poate adăuga conturi.";
    case "gateway_jwt":
      return "Supabase a refuzat cererea: la funcția „invite-user” dezactivează opțiunea „Verify JWT” (Edge Functions → invite-user → Settings), apoi încearcă din nou. Funcția verifică ea însăși că ești administrator.";
    case "unreachable":
      return "Funcția de invitare nu răspunde. Verifică dacă „invite-user” este publicată în Supabase (README, secțiunea 8).";
    case "invite_failed":
      return /rate limit/i.test(error.detail ?? "")
        ? "Supabase a trimis deja prea multe emailuri în ultima oră. Încearcă mai târziu sau creează contul cu parolă."
        : "Invitația nu a putut fi trimisă pe email. Verifică setările de email din Supabase sau creează contul cu parolă.";
    default:
      return "Contul nu a putut fi creat. Încearcă din nou.";
  }
}

const InviteForm = () => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<InviteRequest["mode"]>("invite");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("editor");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invite = useMutation({
    mutationFn: (request: InviteRequest) => inviteStaff(request),
    onSuccess: (status) => {
      toast.success(
        status === "invited"
          ? `Invitația a fost trimisă la ${email.trim()}.`
          : status === "created"
            ? `Contul ${email.trim()} a fost creat. Spune-i persoanei parola aleasă.`
            : `${email.trim()} avea deja cont: acum este activ.`,
      );
      setEmail("");
      setName("");
      setPassword("");
      setRole("editor");
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
    onError: (e) => setError(inviteErrorMessage(e)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (mode === "password" && password.length < 8) {
      setError("Parola trebuie să aibă cel puțin 8 caractere.");
      return;
    }
    invite.mutate(
      mode === "invite"
        ? { mode, email: email.trim(), name: name.trim(), role }
        : { mode, email: email.trim(), name: name.trim(), role, password },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-sm border border-gold/15 bg-secondary/30 p-4 sm:p-6" noValidate>
      <h2 className="flex items-center gap-2 font-display text-xl text-parchment">
        <UserPlus className="h-5 w-5 text-gold" aria-hidden="true" />
        Adaugă o persoană
      </h2>

      <div role="radiogroup" aria-label="Cum se creează contul" className="grid gap-2 sm:grid-cols-2">
        {(
          [
            ["invite", "Invitație pe email", "Primește un link și își alege singur parola."],
            ["password", "Cont cu parolă", "Alegi tu parola și i-o comunici persoanei."],
          ] as const
        ).map(([value, label, hint]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => setMode(value)}
            className={`rounded-sm border p-3 text-left transition-colors ${
              mode === value ? "border-primary bg-primary/15" : "border-gold/20 hover:border-gold/50"
            }`}
          >
            <span className="block font-body text-sm font-medium text-parchment">{label}</span>
            <span className="block font-body text-xs text-muted-foreground">{hint}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="invite-email" className="mb-1 block font-body text-sm text-foreground/80">
            Email *
          </label>
          <input
            id="invite-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="invite-name" className="mb-1 block font-body text-sm text-foreground/80">
            Nume
          </label>
          <input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="invite-role" className="mb-1 block font-body text-sm text-foreground/80">
            Rol
          </label>
          <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={inputClass}>
            <option value="editor">{ROLE_LABELS.editor}</option>
            <option value="admin">{ROLE_LABELS.admin}</option>
          </select>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            {role === "editor"
              ? "Adaugă și modifică doar evenimentele lui."
              : "Poate face tot, inclusiv să adauge și să dezactiveze utilizatori."}
          </p>
        </div>
        {mode === "password" && (
          <div>
            <label htmlFor="invite-password" className="mb-1 block font-body text-sm text-foreground/80">
              Parolă * (minim 8 caractere)
            </label>
            <div className="relative">
              <input
                id="invite-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={invite.isPending}
        className="flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-body text-sm font-medium text-primary-foreground hover:brightness-125 disabled:opacity-60"
      >
        {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
        {mode === "invite" ? "Trimite invitația" : "Creează contul"}
      </button>
    </form>
  );
};

const StaffRow = ({ member, isMe }: { member: StaffMember; isMe: boolean }) => {
  const queryClient = useQueryClient();
  const change = useMutation({
    mutationFn: (changes: Partial<Pick<StaffMember, "role" | "active">>) => updateStaff(member.id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "staff"] }),
    onError: (e) =>
      toast.error(
        e instanceof LastAdminError
          ? "Trebuie să rămână cel puțin un administrator activ."
          : "Modificarea nu a putut fi salvată.",
      ),
  });
  const label = member.name || member.email || "—";

  return (
    <li className="flex flex-col gap-3 rounded-sm border border-gold/15 bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-display text-lg text-parchment">
          {label}
          {isMe && <span className="ml-2 font-body text-xs text-gold">(tu)</span>}
        </p>
        {member.name && <p className="truncate font-body text-sm text-muted-foreground">{member.email}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={`Rolul lui ${label}`}
          value={member.role}
          disabled={isMe || change.isPending}
          onChange={(e) => change.mutate({ role: e.target.value as StaffRole })}
          className="rounded-sm border border-gold/20 bg-secondary/50 px-3 py-2 font-body text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
        >
          <option value="editor">{ROLE_LABELS.editor}</option>
          <option value="admin">{ROLE_LABELS.admin}</option>
        </select>
        <button
          type="button"
          role="switch"
          aria-checked={member.active}
          aria-label={`Acces pentru ${label}`}
          disabled={isMe || change.isPending}
          onClick={() => change.mutate({ active: !member.active })}
          className={`min-w-[7.5rem] rounded-sm border px-3 py-2 font-body text-sm transition-colors disabled:opacity-60 ${
            member.active
              ? "border-primary bg-primary/15 text-parchment"
              : "border-gold/20 text-muted-foreground hover:border-gold/50"
          }`}
        >
          {member.active ? "Activ" : "Inactiv"}
        </button>
      </div>
    </li>
  );
};

const UsersPage = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const query = useQuery({ queryKey: ["admin", "staff"], queryFn: fetchStaff, enabled: isAdmin });

  if (!isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-parchment md:text-4xl">Utilizatori</h1>
        <p className="font-body text-sm text-muted-foreground">
          Cine poate intra în administrare. Un cont inactiv nu mai poate adăuga sau modifica nimic; evenimentele lui rămân pe site.
        </p>
      </div>

      <InviteForm />

      <section className="space-y-3">
        <h2 className="font-display text-xl text-parchment">Conturi</h2>
        {query.isPending && <p className="font-body text-muted-foreground">Se încarcă...</p>}
        {query.isError && (
          <p role="alert" className="font-body text-destructive">
            Lista nu a putut fi încărcată.
          </p>
        )}
        <ul className="space-y-3" data-testid="staff-list">
          {query.data?.map((member) => (
            <StaffRow key={member.id} member={member} isMe={member.id === profile?.id} />
          ))}
        </ul>
      </section>
    </div>
  );
};

export default UsersPage;
