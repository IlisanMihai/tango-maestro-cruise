import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/PageHeader";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import EventTabs from "@/components/EventTabs";
import {
  EVENT_TYPES,
  fetchActiveEvents,
  fetchPastEvents,
  parseEventTypes,
} from "@/lib/events";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
import type { EventType } from "@/lib/supabase";
import { setPageMetadata } from "@/lib/utils";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";
import { SITE_URL } from "@/i18n/languages";

type Tab = "active" | "past";

const GRID = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

// Selected tab and filters are marked with the same orange as the selected language.
const chipClass = (selected: boolean) =>
  `rounded-full border px-2 py-2 text-center font-body text-sm transition-colors sm:px-4 ${
    selected
      ? "border-primary bg-primary/30 text-parchment"
      : "border-primary/30 text-muted-foreground hover:border-primary/70 hover:text-foreground"
  }`;

const SkeletonGrid = () => (
  <div className={GRID} data-testid="event-grid">
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="h-80 animate-pulse rounded-sm border border-gold/10 bg-secondary/40" />
    ))}
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="py-10 text-center" role="alert">
      <p className="mb-4 font-body text-muted-foreground">{t("events.error")}</p>
      <button
        type="button"
        onClick={onRetry}
        className="border border-gold/40 px-6 py-3 font-body text-sm text-parchment rounded-sm hover:border-gold/70"
      >
        {t("events.retry")}
      </button>
    </div>
  );
};

const ActiveEvents = ({ types }: { types: EventType[] }) => {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["events", "active", types.join(",")],
    queryFn: () => fetchActiveEvents({ types }),
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
    retry: false,
  });

  if (!isSupabaseConfigured || query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  if (query.isPending) return <SkeletonGrid />;
  if (query.data.length === 0) {
    return (
      <p className="py-10 font-body text-muted-foreground md:text-center">
        {types.length ? t("events.empty.filtered") : t("events.empty.active")}
      </p>
    );
  }
  return (
    <div className={GRID} data-testid="event-grid">
      {query.data.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

const PastEvents = ({ types }: { types: EventType[] }) => {
  const { t } = useTranslation();
  const query = useInfiniteQuery({
    queryKey: ["events", "past", types.join(",")],
    queryFn: ({ pageParam }) => fetchPastEvents({ types, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length : undefined),
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
    retry: false,
  });

  if (!isSupabaseConfigured || query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  if (query.isPending) return <SkeletonGrid />;
  const events = query.data.pages.flatMap((page) => page.events);
  if (events.length === 0) {
    return (
      <p className="py-10 font-body text-muted-foreground md:text-center">
        {types.length ? t("events.empty.filtered") : t("events.empty.past")}
      </p>
    );
  }
  return (
    <>
      <div className={GRID} data-testid="event-grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {query.hasNextPage && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="border border-gold/40 px-8 py-3.5 font-body text-sm text-parchment rounded-sm hover:border-gold/70 disabled:opacity-50"
          >
            {t("events.loadMore")}
          </button>
        </div>
      )}
    </>
  );
};

const EventsPage = () => {
  const { t } = useTranslation();
  const localize = useLocalizedPath();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "past" ? "past" : "active";
  // Several types can be selected at once: ?type=milonga,practica
  const selectedTypes = parseEventTypes(searchParams.get("type"));

  // Alphabetical by the label in the current language, "altul" (other) always last.
  const types = useMemo(
    () =>
      EVENT_TYPES.filter((ty) => ty !== "altul")
        .map((ty): { value: EventType; label: string } => ({ value: ty, label: t(`event.type.${ty}`) }))
        .sort((a, b) => a.label.localeCompare(b.label))
        .concat({ value: "altul", label: t("event.type.altul") }),
    [t],
  );

  useEffect(() => {
    setPageMetadata({
      title: t("events.meta.title"),
      description: t("events.meta.description"),
      image: `${SITE_URL}/og-image.jpg`,
      url: SITE_URL + localize("/events"),
      type: "website",
    });
  }, [t, localize]);

  // Links keep the other parameter, so tab and filters combine.
  const href = (next: { tab?: Tab; types?: EventType[] }) => {
    const nextTab = next.tab ?? tab;
    const nextTypes = parseEventTypes((next.types ?? selectedTypes).join(","));
    const parts: string[] = [];
    if (nextTab === "past") parts.push("tab=past");
    // Commas stay readable in the address: ?type=milonga,practica
    if (nextTypes.length) parts.push(`type=${nextTypes.join(",")}`);
    return localize("/events") + (parts.length ? `?${parts.join("&")}` : "");
  };

  // A chip toggles its type; "All" clears every selection.
  const toggle = (value: EventType) =>
    selectedTypes.includes(value) ? selectedTypes.filter((ty) => ty !== value) : [...selectedTypes, value];

  return (
    <>
      <PageHeader />
      <main className="pb-16 md:pb-24">
        <div className="max-w-content mx-auto px-6 pt-10 md:pt-16">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-gold mb-3">{t("events.label")}</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-parchment mb-6 md:mb-10">
            {t("events.title")}
          </h1>
        </div>

        {/* The tabs stay at the top while scrolling; the filters (several rows on a phone) scroll away. */}
        <div
          className="sticky z-30 border-y border-gold/10 bg-background/95 backdrop-blur-sm transition-[top] duration-300 motion-reduce:transition-none"
          style={{ top: "var(--page-header-offset, 0px)" }}
        >
          <div className="max-w-content mx-auto px-6 pt-3">
            <EventTabs
              label={t("events.tabs")}
              selected={tab}
              tabs={(["active", "past"] as const).map((value) => ({
                value,
                label: t(`events.tab.${value}`),
                href: href({ tab: value }),
              }))}
            />
          </div>
        </div>
        <div className="border-b border-gold/10">
          <div className="max-w-content mx-auto px-6 py-4">
            <nav aria-label={t("events.filter.label")} className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                onClick={() => navigate(href({ types: [] }), { replace: true })}
                aria-pressed={selectedTypes.length === 0}
                className={chipClass(selectedTypes.length === 0)}
              >
                {t("events.filter.all")}
              </button>
              {types.map(({ value, label }) => {
                const selected = selectedTypes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => navigate(href({ types: toggle(value) }), { replace: true })}
                    aria-pressed={selected}
                    className={chipClass(selected)}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="max-w-content mx-auto px-6 pt-8 md:pt-10">
          {tab === "active" ? <ActiveEvents types={selectedTypes} /> : <PastEvents types={selectedTypes} />}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default EventsPage;
