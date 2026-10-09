import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EventRow } from "@/lib/supabase";
import { eventImageUrl, formatEventDates, localizedText } from "@/lib/events";
import { isLanguage, DEFAULT_LANGUAGE } from "@/i18n/languages";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";
import defaultEventImage from "@/assets/hero-mobile.webp";

/**
 * Phone: photo on the left (half the card, flush with its edges) and the title on
 * the right; below them the date (left) and type (right) on one line, then a
 * 3-line summary. At most half the screen high.
 * Wider screens: photo on top, then title, the date/type line and the summary.
 * The location is shown only on the event page.
 */
const EventCard = ({ event }: { event: EventRow }) => {
  const { t, i18n } = useTranslation();
  const localize = useLocalizedPath();
  const language = isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
  const title = localizedText(event.title, language);
  const summary = localizedText(event.summary, language);
  const image = eventImageUrl(event.image_path) ?? defaultEventImage;

  return (
    <Link
      to={localize(`/events/${event.slug}`)}
      className="group grid max-h-[50svh] grid-cols-2 content-start overflow-hidden rounded-sm border border-gold/15 bg-secondary/40 transition-colors hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:max-h-none sm:grid-cols-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary sm:aspect-[16/9]">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <h3 className="line-clamp-4 self-center p-3 font-display text-lg font-semibold leading-snug text-parchment sm:line-clamp-none sm:self-auto sm:px-5 sm:pb-0 sm:pt-4 sm:text-2xl">
        {title}
      </h3>

      <div className="col-span-2 flex items-baseline justify-between gap-3 px-4 pt-3 sm:col-span-1 sm:px-5 sm:pt-2">
        <p className="font-body text-sm text-gold/90 first-letter:uppercase">
          {formatEventDates(event.start_at, event.end_at, language)}
        </p>
        <p className="shrink-0 font-body text-xs uppercase tracking-[0.15em] text-gold">
          {t(`event.type.${event.type}`)}
        </p>
      </div>

      <div className="col-span-2 px-4 pb-4 pt-2 sm:col-span-1 sm:px-5 sm:pb-5">
        {summary && (
          <p className="line-clamp-3 font-body text-base text-foreground/70 md:text-sm">{summary}</p>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
