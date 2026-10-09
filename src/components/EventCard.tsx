import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EventRow } from "@/lib/supabase";
import { eventImageUrl, formatEventDates, localizedText } from "@/lib/events";
import { isLanguage, DEFAULT_LANGUAGE } from "@/i18n/languages";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

const EventCard = ({ event }: { event: EventRow }) => {
  const { t, i18n } = useTranslation();
  const localize = useLocalizedPath();
  const language = isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
  const title = localizedText(event.title, language);
  const summary = localizedText(event.summary, language);
  const image = eventImageUrl(event.image_path);

  return (
    <Link
      to={localize(`/events/${event.slug}`)}
      className="group flex flex-col overflow-hidden rounded-sm border border-gold/15 bg-secondary/40 transition-colors hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/40 via-secondary to-background">
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 rounded-sm bg-background/80 px-2 py-1 font-body text-xs uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
          {t(`event.type.${event.type}`)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 font-body text-sm text-gold first-letter:uppercase">
          {formatEventDates(event.start_at, event.end_at, language)}
        </p>
        <h3 className="mb-2 font-display text-xl font-semibold text-parchment md:text-2xl">{title}</h3>
        {summary && (
          <p className="mb-4 line-clamp-3 font-body text-base text-foreground/70 md:text-sm">{summary}</p>
        )}
        {event.location && (
          <p className="mt-auto font-body text-sm text-muted-foreground">{event.location}</p>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
