// Kept separate from ./supabase so pages can check the config without
// pulling the Supabase client into the main bundle.

// Tolerate a pasted REST endpoint (".../rest/v1/"): the client needs the bare project URL.
export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?.trim()
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/$/, "");
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
