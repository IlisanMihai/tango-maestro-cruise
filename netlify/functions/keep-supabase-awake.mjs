// Netlify Scheduled Function: one tiny read from Supabase every day, so the free
// Supabase project never counts as "inactive" (it is paused after 7 idle days).
// Uses the public anon key (it can only read published events).

export default async () => {
  const url = process.env.VITE_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("keep-supabase-awake: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set");
    return new Response("not configured", { status: 500 });
  }
  const res = await fetch(`${url}/rest/v1/events?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  console.log(`keep-supabase-awake: Supabase answered ${res.status}`);
  return new Response(`supabase ${res.status}`, { status: res.ok ? 200 : 502 });
};

export const config = {
  schedule: "@daily",
};
