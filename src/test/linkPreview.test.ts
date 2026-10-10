import { describe, expect, it, vi } from "vitest";
import { decodeEntities, handle, isAllowedUrl, parsePreview, type Env } from "../../supabase/functions/link-preview/index";

const env: Env = { url: "https://x.supabase.co", anonKey: "anon", serviceKey: "service" };

function staffClient(active: boolean | null) {
  return ((_url: string, key: string) =>
    key === "anon"
      ? {
          auth: {
            getUser: async () =>
              active === null ? { data: { user: null }, error: { message: "bad" } } : { data: { user: { id: "u1" } }, error: null },
          },
        }
      : {
          from: () => ({
            select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: active === null ? null : { active } }) }) }),
          }),
        }) as never;
}

const post = (body: unknown, token: string | null = "token") =>
  new Request("https://x.supabase.co/functions/v1/link-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });

const page = `<!doctype html><html><head>
  <title>Fallback title</title>
  <meta property="og:title" content="Milonga de toamn&#259; &amp; prieteni" />
  <meta name="description" content="Plain description">
  <meta property='og:description' content='O sear&#x103; de tango &quot;clasic&quot;'>
  <meta property="og:image" content="/img/poster.jpg">
  <meta property="og:site_name" content="Tango Club">
</head><body>...</body></html>`;

describe("parsePreview", () => {
  it("reads Open Graph tags, decodes entities and resolves the image address", () => {
    expect(parsePreview(page, "https://club.example.ro/events/1")).toEqual({
      title: "Milonga de toamnă & prieteni",
      description: 'O seară de tango "clasic"',
      image: "https://club.example.ro/img/poster.jpg",
      siteName: "Tango Club",
      url: "https://club.example.ro/events/1",
    });
  });

  it("falls back to Twitter tags, <title> and the standard description", () => {
    const html = `<title> Doar titlu </title><meta name="twitter:image" content="https://cdn.example.ro/a.png"><meta name="description" content="Descriere">`;
    expect(parsePreview(html, "https://example.ro/")).toMatchObject({
      title: "Doar titlu",
      description: "Descriere",
      image: "https://cdn.example.ro/a.png",
      siteName: null,
    });
  });

  it("returns empty fields for a page without tags", () => {
    expect(parsePreview("<html></html>", "https://example.ro/")).toMatchObject({ title: null, description: null, image: null });
  });

  it("decodes named and numeric entities", () => {
    expect(decodeEntities("&lt;b&gt; &#537;i &#x21B; &apos;x&apos; &unknown;")).toBe("<b> și ț 'x' &unknown;");
  });
});

describe("isAllowedUrl (no access to internal addresses)", () => {
  it("accepts public web pages", () => {
    expect(isAllowedUrl("https://www.facebook.com/events/123")).not.toBeNull();
    expect(isAllowedUrl("http://example.ro/a?b=1")).not.toBeNull();
  });

  it("rejects other schemes and private or local addresses", () => {
    for (const url of [
      "ftp://example.ro/x",
      "javascript:alert(1)",
      "http://localhost:8080/",
      "http://intranet/",
      "http://127.0.0.1/",
      "http://10.0.0.5/",
      "http://192.168.100.101:8080/",
      "http://172.20.1.1/",
      "http://169.254.169.254/latest/meta-data",
      "http://[::1]/",
      "http://[fd00::1]/",
      "http://user:pass@example.ro/",
      "not a url",
    ]) {
      expect(isAllowedUrl(url), url).toBeNull();
    }
  });
});

describe("link-preview function", () => {
  const fetchPage = vi.fn(async () => new Response(page, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }));

  it("needs an active staff login", async () => {
    expect((await handle(post({ mode: "meta", url: "https://a.ro" }, null), env, staffClient(true), fetchPage)).status).toBe(401);
    expect((await handle(post({ mode: "meta", url: "https://a.ro" }), env, staffClient(null), fetchPage)).status).toBe(401);
    expect((await handle(post({ mode: "meta", url: "https://a.ro" }), env, staffClient(false), fetchPage)).status).toBe(403);
  });

  it("returns the page preview", async () => {
    const res = await handle(post({ mode: "meta", url: "https://club.example.ro/events/1" }), env, staffClient(true), fetchPage);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ title: "Milonga de toamnă & prieteni", image: "https://club.example.ro/img/poster.jpg" });
  });

  it("refuses internal addresses, also behind a redirect", async () => {
    const internal = await handle(post({ mode: "meta", url: "http://127.0.0.1/" }), env, staffClient(true), fetchPage);
    expect(internal.status).toBe(400);
    const redirecting = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://169.254.169.254/" } }));
    const res = await handle(post({ mode: "meta", url: "https://evil.example.com/" }), env, staffClient(true), redirecting);
    expect(res.status).toBe(502);
    expect(redirecting).toHaveBeenCalledTimes(1);
  });

  it("hands images back as bytes and rejects non-images", async () => {
    const png = new Uint8Array([137, 80, 78, 71]);
    const okImage = vi.fn(async () => new Response(png, { status: 200, headers: { "content-type": "image/png" } }));
    const res = await handle(post({ mode: "image", url: "https://cdn.example.ro/a.png" }), env, staffClient(true), okImage);
    expect(res.headers.get("content-type")).toBe("application/octet-stream");
    expect(res.headers.get("x-image-type")).toBe("image/png");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(png);

    const html = vi.fn(async () => new Response("<html>", { status: 200, headers: { "content-type": "text/html" } }));
    expect((await handle(post({ mode: "image", url: "https://cdn.example.ro/a" }), env, staffClient(true), html)).status).toBe(502);
  });
});
