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
import { deleteEvent, fetchAdminEvents } from "../lib/api";
import { EVENT_TYPE_LABELS } from "../lib/labels";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const StatusBadge = ({ event }: { event: EventRow }) => (
  <span className="flex flex-wrap gap-1.5">
    <span
      className={`rounded-full border px-2 py-0.5 font-body text-xs ${
        event.status === "published" ? "border-primary/60 text-parchment" : "border-gold/30 text-muted-foreground"
      }`}
    >
      {event.status === "published" ? "Publicat" : "Ciornă"}
    </span>
    {hasEnded(event) && (
      <span className="rounded-full border border-gold/15 px-2 py-0.5 font-body text-xs text-muted-foreground">
        Încheiat
      </span>
    )}
  </span>
);

const Actions = ({ event, canDelete, onDelete }: { event: EventRow; canDelete: boolean; onDelete: () => void }) => (
  <div className="flex items-center gap-1">
    <Link
      to={`/admin/events/${event.id}`}
      className="flex items-center gap-1 rounded-sm px-3 py-2 font-body text-sm text-parchment hover:bg-secondary"
    >
      <Pencil className="h-4 w-4" aria-hidden="true" />
      Editează
    </Link>
    {event.status === "published" && (
      <a
        href={`/events/${event.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-sm p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Vezi pe site"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Vezi pe site: {event.title.ro}</span>
      </a>
    )}
    {canDelete && (
      <button
        type="button"
        onClick={onDelete}
        className="rounded-sm p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
        title="Șterge"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Șterge: {event.title.ro}</span>
      </button>
    )}
  </div>
);

const EventsListPage = () => {
  const { profile } = useAuth();
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
      toast.success("Evenimentul a fost șters.");
      notifyEventsChanged();
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Evenimentul nu a putut fi șters."),
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
            {isAdmin ? "Toate evenimentele" : "Evenimentele mele"}
          </h1>
          {query.data && (
            <p className="font-body text-sm text-muted-foreground">
              {query.data.length === 1 ? "1 eveniment" : `${query.data.length} evenimente`}
            </p>
          )}
        </div>
        <Link
          to="/admin/events/new"
          className="flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-body text-sm font-medium text-primary-foreground hover:brightness-125"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adaugă eveniment
        </Link>
      </div>

      <label className="relative mb-6 block">
        <span className="sr-only">Caută</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după titlu, adresă sau locație"
          className="w-full rounded-sm border border-gold/20 bg-secondary/50 py-3 pl-10 pr-4 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </label>

      {query.isPending && <p className="font-body text-muted-foreground">Se încarcă...</p>}
      {query.isError && (
        <p role="alert" className="font-body text-destructive">
          Evenimentele nu au putut fi încărcate.
        </p>
      )}
      {query.isSuccess && events.length === 0 && (
        <p className="py-10 text-center font-body text-muted-foreground">
          {search ? "Niciun eveniment nu se potrivește căutării." : "Nu ai adăugat încă niciun eveniment."}
        </p>
      )}

      {/* Phone and tablet: cards */}
      <ul className="space-y-3 md:hidden" data-testid="admin-event-cards">
        {events.map((event) => (
          <li key={event.id} className="rounded-sm border border-gold/15 bg-secondary/40 p-4">
            <div className="mb-1 flex items-start justify-between gap-3">
              <h2 className="font-display text-lg leading-snug text-parchment">{event.title.ro}</h2>
              <span className="shrink-0 font-body text-xs uppercase tracking-[0.15em] text-gold">
                {EVENT_TYPE_LABELS[event.type]}
              </span>
            </div>
            <p className="mb-2 font-body text-sm text-gold/90 first-letter:uppercase">
              {formatEventDates(event.start_at, event.end_at, "ro")}
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
                <th className="py-3 pr-4 font-normal">Eveniment</th>
                <th className="py-3 pr-4 font-normal">Tip</th>
                <th className="py-3 pr-4 font-normal">Când</th>
                <th className="py-3 pr-4 font-normal">Stare</th>
                <th className="py-3 font-normal">
                  <span className="sr-only">Acțiuni</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gold/10 align-top">
                  <td className="py-3 pr-4">
                    <span className="font-display text-base text-parchment">{event.title.ro}</span>
                    <span className="block text-xs text-muted-foreground">/{event.slug}</span>
                  </td>
                  <td className="py-3 pr-4 text-foreground/80">{EVENT_TYPE_LABELS[event.type]}</td>
                  <td className="py-3 pr-4 text-foreground/80 first-letter:uppercase">
                    {formatEventDates(event.start_at, event.end_at, "ro")}
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
            <AlertDialogTitle>Ștergi evenimentul?</AlertDialogTitle>
            <AlertDialogDescription>
              „{toDelete?.title.ro}” va dispărea de pe site. Acțiunea nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Renunță</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => toDelete && remove.mutate(toDelete.id)}
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventsListPage;
