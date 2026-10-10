// Supabase Edge Function "invite-user": lets an active admin add a staff account.
//   mode "invite"   -> Supabase emails an invitation link (the person sets a password)
//   mode "password" -> the account is created with a password chosen by the admin
// The new profile is activated with the chosen role. If the email already has an
// account, that account is (re)activated instead.
// Deploy: Supabase dashboard -> Edge Functions -> Deploy new function "invite-user",
// paste this file; or `npx supabase functions deploy invite-user --no-verify-jwt`.
// Turn OFF the gateway's "Verify JWT" for this function: projects using the new
// (ES256) signing keys get valid logins rejected by it. The function verifies the
// caller itself (auth.getUser + active admin profile) before doing anything.
import { createClient } from "jsr:@supabase/supabase-js@2";

type Create = typeof createClient;
type Role = "admin" | "editor";

export interface Env {
  url: string;
  anonKey: string;
  serviceKey: string;
}

interface InviteBody {
  mode: "invite" | "password";
  email: string;
  name: string | null;
  role: Role;
  password?: string;
  redirectTo?: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks the request body; returns an error code or the cleaned values. */
export function parseBody(raw: unknown): InviteBody | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "bad_request" };
  const body = raw as Record<string, unknown>;
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return { error: "bad_email" };
  const mode = body.mode === "password" ? "password" : body.mode === "invite" ? "invite" : null;
  if (!mode) return { error: "bad_request" };
  const role: Role = body.role === "admin" ? "admin" : "editor";
  const name = String(body.name ?? "").trim().slice(0, 100) || null;
  const password = typeof body.password === "string" ? body.password : undefined;
  if (mode === "password" && (!password || password.length < 8)) return { error: "weak_password" };
  let redirectTo: string | undefined;
  if (typeof body.redirectTo === "string" && body.redirectTo) {
    try {
      const url = new URL(body.redirectTo);
      if (url.protocol === "https:" || url.protocol === "http:") redirectTo = url.toString();
    } catch {
      return { error: "bad_request" };
    }
  }
  return { mode, email, name, role, password, redirectTo };
}

const alreadyExists = (message: string | undefined) => /already (been )?registered|already exists/i.test(message ?? "");

export async function handle(req: Request, env: Env, create: Create = createClient): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!env.url || !env.anonKey || !env.serviceKey) return json(500, { error: "server_misconfigured" });

  // 1. Who is calling? Must be an active admin.
  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json(401, { error: "not_signed_in" });
  const caller = create(env.url, env.anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: who, error: whoError } = await caller.auth.getUser(authorization.slice(7));
  if (whoError || !who?.user) return json(401, { error: "not_signed_in" });

  const admin = create(env.url, env.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: me } = await admin.from("profiles").select("role, active").eq("id", who.user.id).maybeSingle();
  if (!me || me.role !== "admin" || !me.active) return json(403, { error: "not_admin" });

  // 2. What to do?
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(400, { error: "bad_request" });
  }
  const body = parseBody(raw);
  if ("error" in body) return json(400, { error: body.error });

  // 3. Create (or find) the account.
  let userId: string | null = null;
  let status: "invited" | "created" | "existing";
  if (body.mode === "invite") {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(body.email, {
      data: { name: body.name },
      redirectTo: body.redirectTo,
    });
    if (error && !alreadyExists(error.message)) return json(502, { error: "invite_failed", message: error.message });
    userId = data?.user?.id ?? null;
    status = error ? "existing" : "invited";
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { name: body.name },
    });
    if (error && !alreadyExists(error.message)) return json(502, { error: "create_failed", message: error.message });
    userId = data?.user?.id ?? null;
    status = error ? "existing" : "created";
  }

  // 4. Activate the profile (created by the on_auth_user_created trigger).
  const changes: Record<string, unknown> = { role: body.role, active: true };
  if (body.name) changes.name = body.name;
  const update = admin.from("profiles").update(changes);
  const { error: profileError } = userId ? await update.eq("id", userId) : await update.eq("email", body.email);
  if (profileError) return json(500, { error: "profile_failed", message: profileError.message });

  return json(200, { status });
}

declare const Deno: { serve: (handler: (req: Request) => Promise<Response>) => void; env: { get(name: string): string | undefined } };

if (typeof Deno !== "undefined") {
  Deno.serve((req) =>
    handle(req, {
      url: Deno.env.get("SUPABASE_URL") ?? "",
      anonKey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      serviceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    }),
  );
}
