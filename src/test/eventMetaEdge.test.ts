import { describe, expect, it } from "vitest";
import { injectEventMeta, matchEventPath } from "../../netlify/edge-functions/event-meta/html";

const indexHtml = `<!doctype html>
<html lang="ro">
  <head>
    <title>Tango argentinian în Oradea</title>
    <meta name="description" content="old description" />
    <meta property="og:url" content="https://oradeatango.ro" />
    <meta property="og:image" content="https://oradeatango.ro/og-image.jpg" />
    <meta property="og:title" content="old" />
    <meta property="og:description" content="old" />
    <meta property="og:type" content="website" />
  </head>
  <body><div id="root"></div></body>
</html>`;

describe("matchEventPath", () => {
  it("matches event pages in every language", () => {
    expect(matchEventPath("/events/milonga-1")).toEqual({ lang: "ro", slug: "milonga-1" });
    expect(matchEventPath("/hu/events/milonga-1/")).toEqual({ lang: "hu", slug: "milonga-1" });
  });

  it("ignores everything else", () => {
    expect(matchEventPath("/events")).toBeNull();
    expect(matchEventPath("/de/events/x")).toBeNull();
    expect(matchEventPath("/events/Bad_Slug")).toBeNull();
    expect(matchEventPath("/events/a/b")).toBeNull();
  });
});

describe("injectEventMeta", () => {
  const options = {
    lang: "en" as const,
    siteUrl: "https://oradeatango.ro",
    supabaseUrl: "https://abc.supabase.co",
    pageUrl: "https://oradeatango.ro/en/events/autumn",
  };

  it("replaces title, description and Open Graph tags in the page language", () => {
    const html = injectEventMeta(
      indexHtml,
      {
        slug: "autumn",
        title: { ro: "Milonga de toamnă", en: 'Autumn "milonga" & friends' },
        summary: { ro: "Seară de tango" },
        image_path: "uid-1/poster 1.webp",
      },
      options,
    );
    expect(html).toContain("<title>Autumn &quot;milonga&quot; &amp; friends | Tango Oradea</title>");
    expect(html).toContain('<html lang="en"');
    // English summary missing -> Romanian
    expect(html).toContain('<meta name="description" content="Seară de tango" />');
    expect(html).toContain('<meta property="og:description" content="Seară de tango" />');
    expect(html).toContain(
      '<meta property="og:image" content="https://abc.supabase.co/storage/v1/object/public/event-images/uid-1/poster%201.webp" />',
    );
    expect(html).toContain('<meta property="og:url" content="https://oradeatango.ro/en/events/autumn" />');
    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html.match(/og:title/g)).toHaveLength(1);
  });

  it("falls back to the site image and keeps the old description without a summary", () => {
    const html = injectEventMeta(indexHtml, { slug: "x", title: { ro: "Practică" }, summary: null, image_path: null }, options);
    expect(html).toContain('content="https://oradeatango.ro/og-image.jpg"');
    expect(html).toContain('content="old description"');
  });
});
