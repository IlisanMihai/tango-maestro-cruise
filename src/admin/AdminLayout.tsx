import type { ReactNode } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { ExternalLink, Loader2, LogOut } from "lucide-react";
import { useAuth } from "./auth";
import { useAdminHead } from "./useAdminHead";
import { useAdminT } from "./i18n";
import AdminLanguageSwitch from "./components/AdminLanguageSwitch";

const AdminNavLink = ({ to, end, children }: { to: string; end?: boolean; children: ReactNode }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `border-b-2 pb-2 font-body text-sm transition-colors ${
        isActive ? "border-primary text-parchment" : "border-transparent text-muted-foreground hover:text-foreground"
      }`
    }
  >
    {children}
  </NavLink>
);

export const FullPageSpinner = () => {
  const { t } = useAdminT();
  return (
    <div className="flex min-h-screen items-center justify-center" aria-busy="true">
      <Loader2 className="h-8 w-8 animate-spin text-gold" aria-label={t("app.loading")} />
    </div>
  );
};

/** Top bar of the admin area: site name, who is logged in, link to the site, logout. */
export const AdminLayout = ({ children }: { children: ReactNode }) => {
  useAdminHead();
  const { t } = useAdminT();
  const { profile, session, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/10 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/admin" className="font-display text-lg text-parchment hover:text-gold">
            {t("app.title")}
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <AdminLanguageSwitch />
            <span className="hidden max-w-[16rem] truncate font-body text-sm text-muted-foreground sm:inline">
              {profile?.name || session?.user.email}
              {profile?.role === "admin" && <span className="ml-2 text-gold">· {t("nav.adminBadge")}</span>}
            </span>
            <a
              href="/events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-sm px-2 py-1.5 font-body text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("nav.viewSite")}</span>
              <span className="sr-only sm:hidden">{t("nav.viewSite")}</span>
            </a>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-1 rounded-sm px-2 py-1.5 font-body text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("nav.signOut")}</span>
              <span className="sr-only sm:hidden">{t("nav.signOut")}</span>
            </button>
          </div>
        </div>
        <nav aria-label={t("nav.sections")} className="mx-auto flex max-w-5xl gap-5 px-4 sm:px-6">
          <AdminNavLink to="/admin" end>
            {t("nav.events")}
          </AdminNavLink>
          {profile?.role === "admin" && <AdminNavLink to="/admin/users">{t("nav.users")}</AdminNavLink>}
          <AdminNavLink to="/admin/account">{t("nav.account")}</AdminNavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 md:pt-10">{children}</main>
    </div>
  );
};

/** Lets only signed-in, active staff through; everyone else goes to the login page. */
export const RequireStaff = ({ children }: { children: ReactNode }) => {
  useAdminHead();
  const { t } = useAdminT();
  const { session, profile, loading, signOut } = useAuth();
  const location = useLocation();

  // Only the first check shows a spinner; later checks keep the page (and any
  // half-filled form) mounted.
  if (loading && !profile) return <FullPageSpinner />;
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!profile?.active) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center" role="alert">
          <h1 className="mb-3 font-display text-3xl text-parchment">{t("inactive.title")}</h1>
          <p className="mb-6 font-body text-muted-foreground">{t("inactive.text", { email: session.user.email })}</p>
          <button
            type="button"
            onClick={signOut}
            className="rounded-sm border border-gold/40 px-6 py-3 font-body text-sm text-parchment hover:border-gold/70"
          >
            {t("nav.signOut")}
          </button>
        </div>
      </div>
    );
  }
  return <AdminLayout>{children}</AdminLayout>;
};
