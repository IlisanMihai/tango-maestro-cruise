import { supabase, type EventRow } from "@/lib/supabase";
import type { EventPayload } from "./eventForm";
import { extensionFor } from "./resizeImage";

export type StaffRole = "admin" | "editor";

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  role: StaffRole;
  active: boolean;
}

export class SlugTakenError extends Error {
  constructor() {
    super("slug-taken");
  }
}

function db() {
  if (!supabase) throw new Error("Supabase nu este configurat (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  return supabase;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await db()
    .from("profiles")
    .select("id, email, name, role, active")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

/** Admin: every event. Editor: only their own (drafts included). Newest first. */
export async function fetchAdminEvents(profile: Profile): Promise<EventRow[]> {
  let query = db().from("events").select("*");
  if (profile.role !== "admin") query = query.eq("created_by", profile.id);
  const { data, error } = await query.order("start_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function fetchEventById(id: string): Promise<EventRow | null> {
  const { data, error } = await db().from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as EventRow | null;
}

/** Creates (no id) or updates an event. created_by is set by the database. */
export async function saveEvent(payload: EventPayload, id?: string): Promise<EventRow> {
  const query = id
    ? db().from("events").update(payload).eq("id", id)
    : db().from("events").insert(payload);
  const { data, error } = await query.select().single();
  if (error) {
    if (error.code === "23505") throw new SlugTakenError();
    throw error;
  }
  return data as EventRow;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await db().from("events").delete().eq("id", id);
  if (error) throw error;
}

/** Uploads a resized photo into the user's own folder: event-images/<uid>/<name>.webp */
export async function uploadEventImage(blob: Blob, userId: string, baseName: string): Promise<string> {
  const safe = baseName.replace(/[^a-z0-9-]/g, "").slice(0, 60) || "eveniment";
  const path = `${userId}/${safe}-${Date.now()}.${extensionFor(blob)}`;
  const { error } = await db()
    .storage.from("event-images")
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return path;
}
