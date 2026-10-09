import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./supabaseConfig";

export { isSupabaseConfigured };

/** null when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set (e.g. a build without env vars). */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export type Locale = "ro" | "en" | "hu" | "es" | "sk";
/** 'ro' is always present; other languages are optional. */
export type I18nText = { ro: string } & Partial<Record<Exclude<Locale, "ro">, string>>;

export type EventType =
  | "altul"
  | "concert"
  | "curs"
  | "encuentro"
  | "festival"
  | "maraton"
  | "milonga"
  | "practica"
  | "workshop";

export type EventRow = {
  id: string;
  slug: string;
  type: EventType;
  start_at: string;
  end_at: string;
  title: I18nText;
  summary: I18nText | null;
  content: I18nText | null;
  location: string | null;
  image_path: string | null;
  external_url: string | null;
  status: "draft" | "published";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
