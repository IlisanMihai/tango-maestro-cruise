// Quick read check against Supabase with the public anon key.
// Usage: npm run supabase:check   (reads .env.local)
import { createClient } from "@supabase/supabase-js";

// Tolerate a pasted REST endpoint (".../rest/v1/"): the client needs the bare project URL.
const url = process.env.VITE_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
let ok = true;

const { data, error } = await supabase
  .from("events")
  .select("slug, type, status, start_at, end_at, title")
  .order("start_at");
if (error) {
  console.error("Read failed:", error.message);
  console.error("Check VITE_SUPABASE_URL: it must look like https://<project-id>.supabase.co");
  process.exit(1);
}
console.log(`Anon sees ${data.length} event(s):`);
for (const e of data) console.log(`  - [${e.type}] ${e.slug} ${e.start_at} -> ${e.title.ro}`);

if (!data.some((e) => e.slug === "carolina-jador-oradea-2026")) {
  console.error("FAIL: seed event 'carolina-jador-oradea-2026' not found (did you run supabase/seed.sql?)");
  ok = false;
}
if (data.some((e) => e.status !== "published")) {
  console.error("FAIL: anon can see draft events");
  ok = false;
}

const { error: insertError } = await supabase.from("events").insert({
  slug: "anon-write-check",
  type: "altul",
  start_at: new Date().toISOString(),
  end_at: new Date().toISOString(),
  title: { ro: "should not be written" },
});
if (!insertError) {
  console.error("FAIL: anon was able to insert an event");
  ok = false;
} else {
  console.log("Anon insert correctly refused:", insertError.message);
}

console.log(ok ? "OK" : "Some checks failed.");
process.exitCode = ok ? 0 : 1;
