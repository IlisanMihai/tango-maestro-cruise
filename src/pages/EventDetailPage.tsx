import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarDays, CalendarPlus, ExternalLink, MapPin, UserRound } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import NotFound from "@/pages/NotFound";
import {
  eventImageUrl,
  fetchEventAuthorName,
  fetchEventBySlug,
  formatEventDates,
  googleCalendarUrl,
  hasEnded,
  localizedText,
  mapsUrl,
} from "@/lib/events";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
import { setPageMetadata } from "@/lib/utils";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";
import { DEFAULT_LANGUAGE, SITE_URL, isLanguage } from "@/i18n/languages";
import defaultEventImage from "@/assets/hero-mobile.webp";

const EventDetailPage = () => {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const localize = useLocalizedPath();
  const language = isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;

  const query = useQuery({
    queryKey: ["event", slug],
    queryFn: () => fetchEventBySlug(slug),
    enabled: isSupabaseConfigured && slug !== "",
    retry: false,
  });
  const event = query.data;

  // Optional extra: if it fails, the page simply shows no author.
  const author = useQuery({
    queryKey: ["event", "author", event?.id],
    queryFn: () => fetchEventAuthorName(event!.id),
    enabled: Boolean(event?.id),
    retry: false,
  });
  const authorName = author.data ?? null;

  const title = event ? localizedText(event.title, language) : "";
  const summary = event ? localizedText(event.summary, language) : "";
  const content = event ? localizedText(event.content, language) : "";
  // Events without their own photo get the default tango photo.
  const ownImage = event ? eventImageUrl(event.image_path) : null;
  const image = ownImage ?? defaultEventImage;
  const pageUrl = SITE_URL + localize(`/events/${slug}`);

  useEffect(() => {
    if (!event) return;
    setPageMetadata({
      title: `${title} | Tango Oradea`,
      description: (summary || content).slice(0, 200),
      image: ownImage ?? `${SITE_URL}/og-image.jpg`,
      url: pageUrl,
      type: "article",
    });
  }, [event, title, summary, content, ownImage, pageUrl]);

  if (query.isSuccess && !event) return <NotFound />;

  return (
    <>
      <PageHeader />
      <main className="pb-16 md:pb-24">
        <div className="max-w-content mx-auto px-6 pt-6">
          <Link
            to={localize("/events")}
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("event.back")}
          </Link>
        </div>

        {(!isSupabaseConfigured || query.isError) && (
          <div className="max-w-content mx-auto px-6 py-16 text-center" role="alert">
            <p className="mb-4 font-body text-muted-foreground">{t("events.error")}</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="border border-gold/40 px-6 py-3 font-body text-sm text-parchment rounded-sm hover:border-gold/70"
            >
              {t("events.retry")}
            </button>
          </div>
        )}

        {query.isPending && isSupabaseConfigured && (
          <div className="max-w-content mx-auto px-6 pt-6" aria-busy="true">
            <div className="aspect-[16/9] w-full animate-pulse rounded-sm bg-secondary/40" />
            <div className="mt-6 h-10 w-2/3 animate-pulse rounded-sm bg-secondary/40" />
          </div>
        )}

        {event && (
          <article>
            <div className="max-w-content mx-auto md:px-6 pt-4 md:pt-6">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary/40 md:rounded-sm">
                <img src={image} alt={title} className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="max-w-content mx-auto px-6">
              <div className="mx-auto max-w-2xl pt-8">
                <p className="mb-3 font-body text-sm uppercase tracking-[0.2em] text-gold">
                  {t(`event.type.${event.type}`)}
                </p>
                <h1 className="mb-6 font-display text-4xl md:text-5xl font-semibold leading-tight text-parchment">
                  {title}
                </h1>

                {hasEnded(event) && (
                  <p className="mb-6 rounded-sm border border-gold/20 bg-secondary/40 px-4 py-3 font-body text-sm text-muted-foreground">
                    {t("event.ended")}
                  </p>
                )}

                <dl className="mb-8 space-y-3 font-body text-base">
                  <div className="flex gap-3">
                    <dt className="pt-0.5">
                      <CalendarDays className="h-5 w-5 text-gold" aria-hidden="true" />
                      <span className="sr-only">{t("event.when")}</span>
                    </dt>
                    <dd className="text-foreground/90 first-letter:uppercase">
                      {formatEventDates(event.start_at, event.end_at, language)}
                    </dd>
                  </div>
                  {event.location && (
                    <div className="flex gap-3">
                      <dt className="pt-0.5">
                        <MapPin className="h-5 w-5 text-gold" aria-hidden="true" />
                        <span className="sr-only">{t("event.where")}</span>
                      </dt>
                      <dd className="text-foreground/90">
                        <a
                          href={mapsUrl(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-gold/40 underline-offset-4 hover:text-gold"
                        >
                          {event.location}
                        </a>
                      </dd>
                    </div>
                  )}
                  {authorName && (
                    <div className="flex gap-3">
                      <dt className="pt-0.5">
                        <UserRound className="h-5 w-5 text-gold" aria-hidden="true" />
                        <span className="sr-only">{t("event.addedByLabel")}</span>
                      </dt>
                      <dd className="text-foreground/90">{t("event.addedBy", { name: authorName })}</dd>
                    </div>
                  )}
                </dl>

                {summary && (
                  <p className="mb-6 font-display text-xl md:text-2xl italic leading-relaxed text-parchment/85">
                    {summary}
                  </p>
                )}
                {content && (
                  <div className="mb-10 whitespace-pre-line font-body text-base md:text-lg leading-relaxed text-foreground/80">
                    {content}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {event.external_url && (
                    <a
                      href={event.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-primary px-8 py-3.5 font-body text-base md:text-sm font-medium text-primary-foreground rounded-sm hover:brightness-125 transition-all"
                    >
                      {t("event.moreInfo")}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  {!hasEnded(event) && (
                    <a
                      href={googleCalendarUrl(event, language, pageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-gold/40 px-8 py-3.5 font-body text-base md:text-sm font-medium text-parchment rounded-sm hover:border-gold/70 transition-all"
                    >
                      <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                      {t("event.addToCalendar")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
};

export default EventDetailPage;
