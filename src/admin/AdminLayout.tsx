import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ExternalLink, Loader2, LogOut } from "lucide-react";
import { useAuth } from "./auth";
import { useAdminHead } from "./useAdminHead";

export const FullPageSpinner = () => (
  <div className="flex min-h-screen items-center justify-center" aria-busy="true">
    <Loader2 className="h-8 w-8 animate-spin text-gold" aria-label="Se încarcă" />
  </div>
);

/** Top bar of the admin area: site name, who is logged in, link to the site, logout. */
export const AdminLayout = ({ children }: { children: ReactNode }) => {
  useAdminHead();
  const { profile, session, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/10 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/admin" className="font-display text-lg text-parchment hover:text-gold">
            Administrare
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden max-w-[16rem] truncate font-body text-sm text-muted-foreground sm:inline">
              {profile?.name || session?.user.email}
              {profile?.role === "admin" && <span className="ml-2 text-gold">· admin</span>}
            </span>
            <a
              href="/events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-sm px-2 py-1.5 font-body text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Vezi site-ul</span>
              <span className="sr-only sm:hidden">Vezi site-ul</span>
            </a>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-1 rounded-sm px-2 py-1.5 font-body text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Ieșire</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 md:pt-10">{children}</main>
    </div>
  );
};

/** Lets only signed-in, active staff through; everyone else goes to the login page. */
export const RequireStaff = ({ children }: { children: ReactNode }) => {
  useAdminHead();
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
          <h1 className="mb-3 font-display text-3xl text-parchment">Cont inactiv</h1>
          <p className="mb-6 font-body text-muted-foreground">
            Contul {session.user.email} nu are încă acces la administrare. Cere unui administrator să ți-l activeze.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="rounded-sm border border-gold/40 px-6 py-3 font-body text-sm text-parchment hover:border-gold/70"
          >
            Ieșire
          </button>
        </div>
      </div>
    );
  }
  return <AdminLayout>{children}</AdminLayout>;
};
