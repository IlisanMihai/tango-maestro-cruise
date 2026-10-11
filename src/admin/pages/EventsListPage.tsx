import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { EventRow } from "@/lib/supabase";
import { formatEventDates, hasEnded } from "@/lib/events";
import { notifyEventsChanged } from "@/lib/eventsSync";
import { useAuth } from "../auth";
import { deleteEvent, fetchAdminEvents, type AdminEventRow } from "../lib/api";
import { useAdminT } from "../i18n";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Admins see who added each event. */
const Author = ({ event }: { event: AdminEventRow }) => {
  const { t } = useAdminT();
  const who = event.author?.name || event.author?.email;
  return who ? <span className="block font-body text-xs text-muted-foreground">{t("list.addedBy", { name: who })}</span> : null;
};

const StatusBadge = ({ event }: { event: EventRow }) => {
  const { t } = useAdminT();
  return (
  <span className="flex flex-wrap gap-1.5">
    <span
      className={`rounded-full border px-2 py-0.5 font-body text-xs ${
        event.status === "published" ? "border-primary/60 text-parchment" : "border-gold/30 text-muted-foreground"
      }`}
    >
      {event.status === "published" ? t("list.published") : t("list.draft")}
    </span>
    {hasEnded(event) && (
      <span className="rounded-full border border-gold/15 px-2 py-0.5 font-body text-xs text-muted-foreground">
        {t("list.ended")}
      </span>
    )}
  </span>
  );
};

const Actions = ({ event, canDelete, onDelete }: { event: EventRow; canDelete: boolean; onDelete: () => void }) => {
  const { t } = useAdminT();
  return (
  <div className="flex items-center gap-1">
    <Link
      to={`/admin/events/${event.id}`}
      className="flex items-center gap-1 rounded-sm px-3 py-2 font-body text-sm text-parchment hover:bg-secondary"
    >
      <Pencil className="h-4 w-4" aria-hidden="true" />
      {t("list.edit")}
    </Link>
    {event.status === "published" && (
      <a
        href={`/events/${event.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-sm p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        title={t("list.viewOnSite")}
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{t("list.viewOnSiteNamed", { title: event.title.ro })}</span>
      </a>
    )}
    {canDelete && (
      <button
        type="button"
        onClick={onDelete}
        className="rounded-sm p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
        title={t("list.delete")}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{t("list.deleteNamed", { title: event.title.ro })}</span>
      </button>
    )}
  </div>
  );
};

const EventsListPage = () => {
  const { profile } = useAuth();
  const { t, language } = useAdminT();
  const isAdmin = profile?.role === "admin";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<EventRow | null>(null);

  const query = useQuery({
    queryKey: ["admin", "events", profile?.id, profile?.role],
    queryFn: () => fetchAdminEvents(profile!),
    enabled: Boolean(profile),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      toast.success(t("list.deleted"));
      notifyEventsChanged();
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error(t("list.deleteError")),
  });

  const events = useMemo(() => {
    const needle = normalize(search.trim());
    if (!needle) return query.data ?? [];
    return (query.data ?? []).filter((event) =>
      normalize([...Object.values(event.title), event.slug, event.location ?? ""].join(" ")).includes(needle),
    );
  }, [query.data, search]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-parchment md:text-4xl">
            {isAdmin ? t("list.titleAll") : t("list.titleMine")}
          </h1>
          {query.data && (
            <p className="font-body text-sm text-muted-foreground">
              {t("list.count", { count: query.data.length })}
            </p>
          )}
        </div>
        <Link
          to="/admin/events/new"
          className="flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-body text-sm font-medium text-primary-foreground hover:brightness-125"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("list.add")}
        </Link>
      </div>

      <label className="relative mb-6 block">
        <span className="sr-only">{t("list.search")}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("list.searchPlaceholder")}
          className="w-full rounded-sm border border-gold/20 bg-secondary/50 py-3 pl-10 pr-4 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </label>

      {query.isPending && <p className="font-body text-muted-foreground">{t("app.loadingDots")}</p>}
      {query.isError && (
        <p role="alert" className="font-body text-destructive">
          {t("list.loadError")}
        </p>
      )}
      {query.isSuccess && events.length === 0 && (
        <p className="py-10 text-center font-body text-muted-foreground">
          {search ? t("list.noMatch") : t("list.empty")}
        </p>
      )}

      {/* Phone and tablet: cards */}
      <ul className="space-y-3 md:hidden" data-testid="admin-event-cards">
        {events.map((event) => (
          <li key={event.id} className="rounded-sm border border-gold/15 bg-secondary/40 p-4">
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg leading-snug text-parchment">{event.title.ro}</h2>
                <Author event={event} />
              </div>
              <span className="shrink-0 font-body text-xs uppercase tracking-[0.15em] text-primary">
                {t(`event.type.${event.type}`, { ns: "common" })}
              </span>
            </div>
            <p className="mb-2 font-body text-sm text-gold/90 first-letter:uppercase">
              {formatEventDates(event.start_at, event.end_at, language)}
            </p>
            <StatusBadge event={event} />
            <div className="mt-2 -ml-3">
              <Actions event={event} canDelete={isAdmin} onDelete={() => setToDelete(event)} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      {events.length > 0 && (
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-left text-muted-foreground">
                <th className="py-3 pr-4 font-normal">{t("list.col.event")}</th>
                <th className="py-3 pr-4 font-normal">{t("list.col.type")}</th>
                <th className="py-3 pr-4 font-normal">{t("list.col.when")}</th>
                <th className="py-3 pr-4 font-normal">{t("list.col.status")}</th>
                <th className="py-3 font-normal">
                  <span className="sr-only">{t("list.col.actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gold/10 align-top">
                  <td className="py-3 pr-4">
                    <span className="font-display text-base text-parchment">{event.title.ro}</span>
                    <span className="block text-xs text-muted-foreground">/{event.slug}</span>
                    <Author event={event} />
                  </td>
                  <td className="py-3 pr-4 text-foreground/80">{t(`event.type.${event.type}`, { ns: "common" })}</td>
                  <td className="py-3 pr-4 text-foreground/80 first-letter:uppercase">
                    {formatEventDates(event.start_at, event.end_at, language)}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge event={event} />
                  </td>
                  <td className="py-1">
                    <Actions event={event} canDelete={isAdmin} onDelete={() => setToDelete(event)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("list.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("list.confirmText", { title: toDelete?.title.ro ?? "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("list.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => toDelete && remove.mutate(toDelete.id)}
            >
              {t("list.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventsListPage;
