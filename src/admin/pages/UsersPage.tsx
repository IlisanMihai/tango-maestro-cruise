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
import { useAdminT } from "../i18n";
import type { TFunction } from "i18next";

const inputClass =
  "w-full rounded-sm border border-gold/20 bg-secondary/50 px-3 py-2.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

function inviteErrorMessage(error: unknown, t: TFunction<"admin">): string {
  if (!(error instanceof InviteError)) return t("users.errors.generic");
  switch (error.code) {
    case "bad_email":
      return t("users.errors.badEmail");
    case "weak_password":
      return t("users.errors.weakPassword");
    case "not_admin":
      return t("users.errors.notAdmin");
    case "gateway_jwt":
      return t("users.errors.gateway");
    case "unreachable":
      return t("users.errors.unreachable");
    case "invite_failed":
      return /rate limit/i.test(error.detail ?? "") ? t("users.errors.rateLimit") : t("users.errors.emailFailed");
    default:
      return t("users.errors.generic");
  }
}

const InviteForm = () => {
  const { t } = useAdminT();
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
      const values = { email: email.trim() };
      toast.success(
        status === "invited"
          ? t("users.toast.invited", values)
          : status === "created"
            ? t("users.toast.created", values)
            : t("users.toast.existing", values),
      );
      setEmail("");
      setName("");
      setPassword("");
      setRole("editor");
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
    onError: (e) => setError(inviteErrorMessage(e, t)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (mode === "password" && password.length < 8) {
      setError(t("users.errors.weakPassword"));
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
        {t("users.addPerson")}
      </h2>

      <div role="radiogroup" aria-label={t("users.howCreated")} className="grid gap-2 sm:grid-cols-2">
        {(
          [
            ["invite", t("users.modeInvite"), t("users.modeInviteHint")],
            ["password", t("users.modePassword"), t("users.modePasswordHint")],
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
            {t("users.email")}
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
            {t("users.name")}
          </label>
          <input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="invite-role" className="mb-1 block font-body text-sm text-foreground/80">
            {t("users.role")}
          </label>
          <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={inputClass}>
            <option value="editor">{t("users.roleEditor")}</option>
            <option value="admin">{t("users.roleAdmin")}</option>
          </select>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            {role === "editor" ? t("users.roleEditorHint") : t("users.roleAdminHint")}
          </p>
        </div>
        {mode === "password" && (
          <div>
            <label htmlFor="invite-password" className="mb-1 block font-body text-sm text-foreground/80">
              {t("users.password")}
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
                aria-label={showPassword ? t("users.hidePassword") : t("users.showPassword")}
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
        {mode === "invite" ? t("users.sendInvite") : t("users.create")}
      </button>
    </form>
  );
};

const StaffRow = ({ member, isMe }: { member: StaffMember; isMe: boolean }) => {
  const { t } = useAdminT();
  const queryClient = useQueryClient();
  const change = useMutation({
    mutationFn: (changes: Partial<Pick<StaffMember, "role" | "active">>) => updateStaff(member.id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "staff"] }),
    onError: (e) =>
      toast.error(e instanceof LastAdminError ? t("users.toast.lastAdmin") : t("users.toast.changeFailed")),
  });
  const label = member.name || member.email || "—";

  return (
    <li className="flex flex-col gap-3 rounded-sm border border-gold/15 bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-display text-lg text-parchment">
          {label}
          {isMe && <span className="ml-2 font-body text-xs text-gold">{t("users.you")}</span>}
        </p>
        {member.name && <p className="truncate font-body text-sm text-muted-foreground">{member.email}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={t("users.roleOf", { name: label })}
          value={member.role}
          disabled={isMe || change.isPending}
          onChange={(e) => change.mutate({ role: e.target.value as StaffRole })}
          className="rounded-sm border border-gold/20 bg-secondary/50 px-3 py-2 font-body text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
        >
          <option value="editor">{t("users.roleEditor")}</option>
          <option value="admin">{t("users.roleAdmin")}</option>
        </select>
        <button
          type="button"
          role="switch"
          aria-checked={member.active}
          aria-label={t("users.accessOf", { name: label })}
          disabled={isMe || change.isPending}
          onClick={() => change.mutate({ active: !member.active })}
          className={`min-w-[7.5rem] rounded-sm border px-3 py-2 font-body text-sm transition-colors disabled:opacity-60 ${
            member.active
              ? "border-primary bg-primary/15 text-parchment"
              : "border-gold/20 text-muted-foreground hover:border-gold/50"
          }`}
        >
          {member.active ? t("users.active") : t("users.inactive")}
        </button>
      </div>
    </li>
  );
};

const UsersPage = () => {
  const { t } = useAdminT();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const query = useQuery({ queryKey: ["admin", "staff"], queryFn: fetchStaff, enabled: isAdmin });

  if (!isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-parchment md:text-4xl">{t("users.title")}</h1>
        <p className="font-body text-sm text-muted-foreground">{t("users.intro")}</p>
      </div>

      <InviteForm />

      <section className="space-y-3">
        <h2 className="font-display text-xl text-parchment">{t("users.accounts")}</h2>
        {query.isPending && <p className="font-body text-muted-foreground">{t("app.loadingDots")}</p>}
        {query.isError && (
          <p role="alert" className="font-body text-destructive">
            {t("users.loadError")}
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
