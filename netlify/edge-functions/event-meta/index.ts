// Netlify Edge Function: puts the event's title, description and image into the
// HTML of /events/:slug, so Facebook, WhatsApp etc. show a proper preview
// (their crawlers do not run the React app). Any failure serves the page unchanged.
import type { Config, Context } from "https://edge.netlify.com";
import { injectEventMeta, matchEventPath, type EventMetaRow } from "./html.ts";

const SITE_URL = "https://oradeatango.ro";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const match = matchEventPath(url.pathname);
  if (!match) return;

  const response = await context.next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;

  const supabaseUrl = Netlify.env.get("VITE_SUPABASE_URL")?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const anonKey = Netlify.env.get("VITE_SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return response;

  try {
    const api = new URL(`${supabaseUrl}/rest/v1/events`);
    api.searchParams.set("select", "slug,title,summary,image_path");
    api.searchParams.set("slug", `eq.${match.slug}`);
    api.searchParams.set("status", "eq.published");
    api.searchParams.set("limit", "1");
    const res = await fetch(api, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return response;
    const [event] = (await res.json()) as EventMetaRow[];
    if (!event) return response;

    const html = injectEventMeta(await response.text(), event, {
      lang: match.lang,
      siteUrl: SITE_URL,
      supabaseUrl,
      pageUrl: SITE_URL + url.pathname,
    });
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(html, { status: response.status, headers });
  } catch {
    return response;
  }
};

export const config: Config = {
  path: ["/events/*", "/en/events/*", "/hu/events/*", "/es/events/*", "/sk/events/*"],
};
