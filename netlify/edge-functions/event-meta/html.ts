// Pure helpers for the event-meta edge function (no Deno/Netlify APIs, so Vitest can test them).

export const LANGS = ["ro", "en", "hu", "es", "sk"] as const;
export type Lang = (typeof LANGS)[number];

export interface EventMetaRow {
  slug: string;
  title: Partial<Record<Lang, string>> & { ro: string };
  summary: (Partial<Record<Lang, string>> & { ro: string }) | null;
  image_path: string | null;
}

/** "/en/events/milonga-1" -> { lang: "en", slug: "milonga-1" }; null for any other path. */
export function matchEventPath(pathname: string): { lang: Lang; slug: string } | null {
  const m = pathname.match(/^\/(?:(en|hu|es|sk)\/)?events\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  if (!m) return null;
  return { lang: (m[1] as Lang | undefined) ?? "ro", slug: m[2] };
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const pick = (text: EventMetaRow["title"] | null, lang: Lang) => (text ? text[lang]?.trim() || text.ro : "");

/** Fills <title>, description and Open Graph tags of index.html for one event. */
export function injectEventMeta(
  html: string,
  event: EventMetaRow,
  { lang, siteUrl, supabaseUrl, pageUrl }: { lang: Lang; siteUrl: string; supabaseUrl: string; pageUrl: string },
): string {
  const title = `${pick(event.title, lang)} | Tango Oradea`;
  const description = pick(event.summary, lang).slice(0, 200);
  const image = event.image_path
    ? `${supabaseUrl}/storage/v1/object/public/event-images/${event.image_path.split("/").map(encodeURIComponent).join("/")}`
    : `${siteUrl}/og-image.jpg`;

  const setMeta = (doc: string, attr: "name" | "property", key: string, value: string) => {
    const tag = `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;
    const re = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, "i");
    return re.test(doc) ? doc.replace(re, tag) : doc.replace("</head>", `    ${tag}\n  </head>`);
  };

  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(/<html lang="[^"]*"/i, `<html lang="${lang}"`);
  if (description) {
    out = setMeta(out, "name", "description", description);
    out = setMeta(out, "property", "og:description", description);
  }
  out = setMeta(out, "property", "og:title", title);
  out = setMeta(out, "property", "og:image", image);
  out = setMeta(out, "property", "og:url", pageUrl);
  out = setMeta(out, "property", "og:type", "article");
  return out;
}
