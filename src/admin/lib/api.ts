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

export type AdminEventRow = EventRow & { author?: { name: string | null; email: string | null } | null };

/** Admin: every event (with who added it). Editor: only their own (drafts included). Newest first. */
export async function fetchAdminEvents(profile: Profile): Promise<AdminEventRow[]> {
  let query = db()
    .from("events")
    .select(profile.role === "admin" ? "*, author:profiles(name, email)" : "*");
  if (profile.role !== "admin") query = query.eq("created_by", profile.id);
  const { data, error } = await query.order("start_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AdminEventRow[];
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

export interface StaffMember extends Profile {
  created_at: string;
}

/** Every staff account (RLS lets only admins read other profiles). */
export async function fetchStaff(): Promise<StaffMember[]> {
  const { data, error } = await db()
    .from("profiles")
    .select("id, email, name, role, active, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StaffMember[];
}

export class LastAdminError extends Error {
  constructor() {
    super("last-admin");
  }
}

export async function updateStaff(id: string, changes: Partial<Pick<Profile, "role" | "active" | "name">>) {
  const { error } = await db().from("profiles").update(changes).eq("id", id);
  if (error) {
    // raised by the profiles_keep_an_admin trigger
    if (error.code === "23514" || /administrator activ/i.test(error.message)) throw new LastAdminError();
    throw error;
  }
}

export type InviteRequest =
  | { mode: "invite"; email: string; name: string; role: StaffRole }
  | { mode: "password"; email: string; name: string; role: StaffRole; password: string };

export type InviteResult = "invited" | "created" | "existing";

/** Calls the invite-user Edge Function (it checks on the server that the caller is an admin). */
export async function inviteStaff(request: InviteRequest): Promise<InviteResult> {
  const { data, error } = await db().functions.invoke<{ status: InviteResult }>("invite-user", {
    body: { ...request, redirectTo: `${window.location.origin}/admin/set-password` },
  });
  if (error) {
    // FunctionsHttpError carries the function's JSON answer
    const response = (error as { context?: Response }).context;
    let detail: { error?: string; message?: string; msg?: string; code?: string } = {};
    try {
      detail = (await response?.json()) ?? {};
    } catch {
      // not JSON / no response: function not deployed or network problem
    }
    if (detail.error) throw new InviteError(detail.error, detail.message);
    // An answer from Supabase's gateway, not from our function: with the new
    // signing keys, the function's "Verify JWT" option rejects valid logins.
    if (response?.status === 401) throw new InviteError("gateway_jwt", detail.message ?? detail.msg);
    if (response?.status === 404) throw new InviteError("unreachable", "not found");
    throw new InviteError("unreachable", detail.message ?? detail.msg);
  }
  return data!.status;
}

export class InviteError extends Error {
  constructor(
    public code: string,
    public detail?: string,
  ) {
    super(code);
  }
}

export async function sendPasswordReset(email: string) {
  const { error } = await db().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/set-password`,
  });
  if (error) throw error;
}

export async function setOwnPassword(password: string) {
  const { error } = await db().auth.updateUser({ password });
  if (error) throw error;
}

/** Changes only the signed-in person's own display name (database function set_my_name). */
export async function setMyName(name: string) {
  const { error } = await db().rpc("set_my_name", { new_name: name });
  if (error) throw error;
}

export interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  url: string;
}

/** Turns a failed Edge Function call into an InviteError-style code (shared with invite-user). */
async function functionError(error: unknown): Promise<InviteError> {
  const response = (error as { context?: Response }).context;
  let detail: { error?: string; message?: string; msg?: string } = {};
  try {
    detail = (await response?.json()) ?? {};
  } catch {
    // not JSON / no response
  }
  if (detail.error) return new InviteError(detail.error, detail.message);
  if (response?.status === 401) return new InviteError("gateway_jwt", detail.message ?? detail.msg);
  return new InviteError("unreachable", detail.message ?? detail.msg);
}

/** Title, description and image a page publishes for link previews (link-preview Edge Function). */
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const { data, error } = await db().functions.invoke<LinkPreview>("link-preview", { body: { mode: "meta", url } });
  if (error) throw await functionError(error);
  return data!;
}

/** Downloads a preview image through the link-preview function (browsers may not fetch other sites). */
export async function fetchLinkImage(url: string): Promise<Blob> {
  const { data, error } = await db().functions.invoke<Blob>("link-preview", { body: { mode: "image", url } });
  if (error) throw await functionError(error);
  if (!(data instanceof Blob) || data.size === 0) throw new InviteError("no_image");
  return data;
}
