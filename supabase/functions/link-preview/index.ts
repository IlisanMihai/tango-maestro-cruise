// Supabase Edge Function "link-preview": reads the public preview of a web page
// (Open Graph / Twitter tags: title, description, image) for the admin form.
// No AI: just the tags sites already publish for WhatsApp / Facebook previews.
//   { mode: "meta",  url }  -> { title, description, image, siteName, url }
//   { mode: "image", url }  -> the image bytes (so the browser can resize & upload it)
// Only signed-in, active staff may call it. Deploy like invite-user, with
// "Verify JWT" OFF (the function checks the caller itself):
//   `npx supabase functions deploy link-preview --no-verify-jwt`
import { createClient } from "jsr:@supabase/supabase-js@2";

type Create = typeof createClient;
type Fetch = typeof fetch;

export interface Env {
  url: string;
  anonKey: string;
  serviceKey: string;
}

export interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  url: string;
}

const MAX_HTML_BYTES = 1_500_000;
const MAX_IMAGE_BYTES = 8_000_000;
const TIMEOUT_MS = 8_000;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

/** Only public http(s) addresses: never this server, the local network or cloud metadata. */
export function isAllowedUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host.includes(".") && !host.includes(":")) return null; // "localhost", intranet names
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return null;
  const v4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224) {
      return null;
    }
  }
  if (host.includes(":")) {
    // IPv6 literal: allow only global unicast (2000::/3)
    if (!/^[23][0-9a-f]{0,3}:/i.test(host)) return null;
  }
  return url;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

const clean = (text: string | undefined, max: number) => {
  const value = text ? decodeEntities(text).replace(/\s+/g, " ").trim() : "";
  return value ? value.slice(0, max) : null;
};

/** Reads og:/twitter:/standard tags from a page's HTML. */
export function parsePreview(html: string, pageUrl: string): LinkPreview {
  const head = html.slice(0, MAX_HTML_BYTES);
  const meta: Record<string, string> = {};
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const attr = (name: string) =>
      tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(2).find((v) => v !== undefined);
    const key = (attr("property") ?? attr("name") ?? attr("itemprop"))?.toLowerCase();
    const content = attr("content");
    if (key && content !== undefined && !(key in meta)) meta[key] = content;
  }
  const titleTag = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const imageRaw = meta["og:image:secure_url"] ?? meta["og:image"] ?? meta["og:image:url"] ?? meta["twitter:image"] ?? meta["twitter:image:src"] ?? meta["image"];
  let image: string | null = null;
  if (imageRaw) {
    try {
      image = new URL(decodeEntities(imageRaw.trim()), pageUrl).toString();
    } catch {
      image = null;
    }
  }
  return {
    title: clean(meta["og:title"] ?? meta["twitter:title"] ?? titleTag, 200),
    description: clean(meta["og:description"] ?? meta["twitter:description"] ?? meta["description"], 1000),
    image: image && isAllowedUrl(image) ? image : null,
    siteName: clean(meta["og:site_name"], 100),
    url: pageUrl,
  };
}

async function readLimited(res: Response, limit: number): Promise<Uint8Array | null> {
  const reader = res.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Follows redirects by hand so every hop is checked against isAllowedUrl. */
async function safeFetch(start: URL, fetchImpl: Fetch, accept: string): Promise<Response | null> {
  let url = start;
  for (let hop = 0; hop < 5; hop++) {
    const res = await fetchImpl(url.toString(), {
      redirect: "manual",
      signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(TIMEOUT_MS) : undefined,
      headers: {
        // Many sites (Facebook included) only show their preview tags to link-preview bots.
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: accept,
        "Accept-Language": "ro,en;q=0.8",
      },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      const next = isAllowedUrl(new URL(res.headers.get("location")!, url).toString());
      if (!next) return null;
      url = next;
      continue;
    }
    Object.defineProperty(res, "finalUrl", { value: url.toString() });
    return res;
  }
  return null;
}

export async function handle(req: Request, env: Env, create: Create = createClient, fetchImpl: Fetch = fetch): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!env.url || !env.anonKey || !env.serviceKey) return json(500, { error: "server_misconfigured" });

  // Only active staff (admins and editors).
  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json(401, { error: "not_signed_in" });
  const caller = create(env.url, env.anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: who, error: whoError } = await caller.auth.getUser(authorization.slice(7));
  if (whoError || !who?.user) return json(401, { error: "not_signed_in" });
  const admin = create(env.url, env.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: me } = await admin.from("profiles").select("active").eq("id", who.user.id).maybeSingle();
  if (!me?.active) return json(403, { error: "not_staff" });

  let body: { mode?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_request" });
  }
  const target = isAllowedUrl(String(body.url ?? "").trim());
  if (!target) return json(400, { error: "bad_url" });

  try {
    if (body.mode === "image") {
      const res = await safeFetch(target, fetchImpl, "image/*");
      const type = res?.headers.get("content-type") ?? "";
      if (!res?.ok || !type.startsWith("image/")) return json(502, { error: "no_image" });
      const bytes = await readLimited(res, MAX_IMAGE_BYTES);
      if (!bytes) return json(413, { error: "image_too_big" });
      // octet-stream: supabase-js hands it to the browser as a Blob
      return new Response(bytes, {
        status: 200,
        headers: { ...cors, "Content-Type": "application/octet-stream", "X-Image-Type": type },
      });
    }

    const res = await safeFetch(target, fetchImpl, "text/html,application/xhtml+xml");
    if (!res?.ok) return json(502, { error: "page_unreachable", status: res?.status ?? 0 });
    const type = res.headers.get("content-type") ?? "";
    if (type && !type.includes("html")) return json(422, { error: "not_html" });
    const bytes = await readLimited(res, MAX_HTML_BYTES * 2);
    const html = new TextDecoder().decode(bytes ?? new Uint8Array());
    const finalUrl = (res as Response & { finalUrl?: string }).finalUrl ?? target.toString();
    return json(200, { ...parsePreview(html, finalUrl) });
  } catch {
    return json(502, { error: "page_unreachable" });
  }
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
