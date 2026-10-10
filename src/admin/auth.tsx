import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { fetchProfile, type Profile } from "./lib/api";

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  /** true until the stored session (and its profile) has been read */
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-reads the profile, so a role change or deactivation by an admin applies right away. */
  refreshProfile: () => Promise<void>;
}

const PROFILE_RECHECK_MS = 60_000;

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Whose profile is loaded: Supabase re-announces SIGNED_IN for the same user
  // whenever the tab becomes visible again; that must not reload anything.
  const profileUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (next: Session | null) => {
    if (!next) {
      profileUserId.current = null;
      setSession(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    if (profileUserId.current === next.user.id) {
      setSession(next);
      return;
    }
    profileUserId.current = next.user.id;
    // Stay "loading" until the profile arrives: a session without its profile
    // would otherwise flash the "inactive account" screen right after login.
    setLoading(true);
    setSession(next);
    try {
      setProfile(await fetchProfile(next.user.id));
    } catch {
      profileUserId.current = null;
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => loadProfile(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      // Token refreshes keep the same user: no need to reload the profile.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Defer: Supabase must not be called from inside this callback.
        setTimeout(() => loadProfile(next), 0);
      } else {
        setSession(next);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const userId = profileUserId.current;
    if (!userId) return;
    try {
      const fresh = await fetchProfile(userId);
      if (profileUserId.current !== userId) return; // signed out meanwhile
      setProfile((current) =>
        current && fresh && current.active === fresh.active && current.role === fresh.role && current.name === fresh.name
          ? current
          : fresh,
      );
    } catch {
      // offline or temporary error: keep what we have; the database still enforces access
    }
  }, []);

  // Re-check every minute and whenever the tab becomes visible again.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshProfile();
    };
    const timer = window.setInterval(refreshProfile, PROFILE_RECHECK_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshProfile]);

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase nu este configurat.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error("Supabase nu este configurat.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    profileUserId.current = null;
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signInWithPassword, signInWithGoogle, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
