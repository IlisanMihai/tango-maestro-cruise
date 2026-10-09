import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase, type EventRow } from "@/lib/supabase";

/** Dev-only page (/dev/supabase): lists the events the anon key can read. Not routed in production builds. */
const DevSupabaseCheck = () => {
  const [state, setState] = useState<{ events?: EventRow[]; error?: string }>({});

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("events")
      .select("*")
      .order("start_at")
      .then(({ data, error }) => setState(error ? { error: error.message } : { events: data as EventRow[] }));
  }, []);

  return (
    <main className="container py-10 font-mono text-sm">
      <h1 className="mb-4 text-lg font-bold">Supabase read check</h1>
      {!isSupabaseConfigured && <p>Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local</p>}
      {state.error && <p className="text-red-600">Error: {state.error}</p>}
      {state.events && <p className="mb-2">{state.events.length} event(s) visible to anon:</p>}
      <pre className="whitespace-pre-wrap">{state.events && JSON.stringify(state.events, null, 2)}</pre>
    </main>
  );
};

export default DevSupabaseCheck;
