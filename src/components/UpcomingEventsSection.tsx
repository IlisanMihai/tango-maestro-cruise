import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import EventCard from "@/components/EventCard";
import { fetchUpcomingEvents } from "@/lib/events";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

const UPCOMING_COUNT = 3;

/** Next 3 events from Supabase. Renders nothing if Supabase is not configured or unreachable. */
const UpcomingEventsSection = () => {
  const { t } = useTranslation();
  const localize = useLocalizedPath();
  const { data, isPending, isError } = useQuery({
    queryKey: ["events", "upcoming", UPCOMING_COUNT],
    queryFn: () => fetchUpcomingEvents(UPCOMING_COUNT),
    enabled: isSupabaseConfigured,
    // supabase-js already retries failed reads (about 7 s in total) before giving up.
    retry: false,
  });

  if (!isSupabaseConfigured || isError) return null;

  return (
    <section id="events" className="py-16 md:py-24" aria-busy={isPending}>
      <div className="max-w-content mx-auto px-6">
        <p className="font-body text-sm md:text-center tracking-[0.3em] uppercase text-gold mb-4">
          {t("home.upcoming.label")}
        </p>
        <h2 className="font-display text-3xl md:text-5xl md:text-center font-semibold text-parchment mb-10 md:mb-14">
          {t("home.upcoming.title")}
        </h2>

        {isPending ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: UPCOMING_COUNT }, (_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-sm border border-gold/10 bg-secondary/40" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="font-body text-base text-muted-foreground md:text-center">{t("home.upcoming.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="event-grid">
            {data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="mt-10 md:text-center">
          <Link
            to={localize("/events")}
            className="inline-block border border-gold/40 text-parchment px-8 py-3.5 font-body text-base md:text-sm font-medium tracking-wide rounded-sm hover:border-gold/70 transition-all"
          >
            {t("home.upcoming.all")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
