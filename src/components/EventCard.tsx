import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EventRow } from "@/lib/supabase";
import { eventImageUrl, formatEventDates, localizedText } from "@/lib/events";
import { isLanguage, DEFAULT_LANGUAGE } from "@/i18n/languages";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";
import defaultEventImage from "@/assets/hero-mobile.webp";

/**
 * Phone: photo on the left (60% of the card, flush with its edges); next to it the
 * date at the top and the type (orange) at the bottom right; below them the
 * title (max 2 lines) and a 3-line summary. At most half the screen high.
 * Wider screens: photo on top, then the type (right), the date (left), the
 * title and the summary. The location is shown only on the event page.
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
      className="group grid max-h-[50svh] grid-cols-[minmax(0,60fr)_minmax(0,40fr)] content-start overflow-hidden rounded-sm border border-gold/15 bg-secondary/40 transition-colors hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:max-h-none sm:grid-cols-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary sm:aspect-[16/9]">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Phone: date on top, type at the bottom. Wider: type first (right), then the date. */}
      <div className="flex flex-col justify-between gap-2 px-3 pt-3 pb-0 sm:flex-col-reverse sm:justify-start sm:gap-1 sm:px-5 sm:pb-0 sm:pt-3">
        <p className="font-body text-sm text-gold/90 first-letter:uppercase">
          {formatEventDates(event.start_at, event.end_at, language)}
        </p>
        {/* On phones its bottom lines up exactly with the bottom of the photo. */}
        <p className="self-end font-body text-xs font-medium uppercase leading-none tracking-[0.15em] text-primary sm:leading-normal">
          {t(`event.type.${event.type}`)}
        </p>
      </div>

      {/* Long titles end with "…": at most 2 lines on phones, 3 on wider screens. */}
      <h3 className="col-span-2 line-clamp-2 px-4 pt-3 sm:line-clamp-3 font-display text-xl font-semibold leading-snug text-parchment sm:col-span-1 sm:px-5 sm:pt-2 sm:text-2xl">
        {title}
      </h3>

      <div className="col-span-2 px-4 pb-4 pt-1 sm:col-span-1 sm:px-5 sm:pb-5">
        {summary && (
          <p className="line-clamp-3 font-body text-base text-foreground/70 md:text-sm">{summary}</p>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
