import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Controller, useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Camera, Eye, ImageOff, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EventCard from "@/components/EventCard";
import { eventImageUrl } from "@/lib/events";
import type { EventRow, Locale } from "@/lib/supabase";
import { LANGUAGES } from "@/i18n/languages";
import defaultEventImage from "@/assets/hero-mobile.webp";
import { notifyEventsChanged } from "@/lib/eventsSync";
import { useAuth } from "../auth";
import {
  InviteError,
  SlugTakenError,
  fetchEventById,
  fetchLinkImage,
  fetchLinkPreview,
  saveEvent,
  uploadEventImage,
  type LinkPreview,
} from "../lib/api";
import {
  emptyEventForm,
  eventFormSchema,
  eventFromForm,
  formFromEvent,
  type EventFormValues,
} from "../lib/eventForm";
import { EVENT_TYPE_LABELS, EVENT_TYPE_OPTIONS, LANGUAGE_NAMES } from "../lib/labels";
import { resizeImage } from "../lib/resizeImage";
import DateTimePicker from "../components/DateTimePicker";
import LocationPicker from "../components/LocationPicker";
import LinkPrefill from "../components/LinkPrefill";
import { slugify } from "../lib/slug";
import { shortSummary } from "../lib/text";

const inputClass =
  "w-full rounded-sm border border-gold/20 bg-secondary/50 px-3 py-2.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive";

const Field = ({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: FieldError | { message?: string };
  children: ReactNode;
}) => (
  <div>
    <label id={`${htmlFor}-label`} htmlFor={htmlFor} className="mb-1 block font-body text-sm text-foreground/80">
      {label}
    </label>
    {children}
    {hint && !error && <p className="mt-1 font-body text-xs text-muted-foreground">{hint}</p>}
    {error?.message && (
      <p role="alert" className="mt-1 font-body text-sm text-destructive">
        {error.message}
      </p>
    )}
  </div>
);

/** Comparable form content (field order, empty select and undefined vs "" do not matter). */
function snapshot(v: Partial<EventFormValues>): string {
  const texts = (t?: Partial<Record<Locale, string>>) => LANGUAGES.map((lng) => (t?.[lng] ?? "").trim());
  return JSON.stringify([
    v.type || "",
    v.start || "",
    v.end || "",
    v.slug || "",
    v.status || "draft",
    (v.location ?? "").trim(),
    (v.external_url ?? "").trim(),
    v.image_path ?? null,
    v.latitude ?? null,
    v.longitude ?? null,
    texts(v.title),
    texts(v.summary),
    texts(v.content),
  ]);
}

function prefillErrorMessage(error: unknown): string {
  const code = error instanceof InviteError ? error.code : "";
  switch (code) {
    case "bad_url":
      return "Linkul nu pare valid. Copiază adresa completă, care începe cu https://";
    case "page_unreachable":
    case "not_html":
      return "Pagina nu a putut fi citită. Verifică linkul sau completează manual.";
    case "gateway_jwt":
      return "Supabase a refuzat cererea: la funcția „link-preview” dezactivează opțiunea „Verify JWT”.";
    case "unreachable":
      return "Funcția „link-preview” nu răspunde. Verifică dacă este publicată în Supabase (README, secțiunea 9).";
    default:
      return "Datele de la link nu au putut fi preluate. Completează manual.";
  }
}

function readDraft(key: string): EventFormValues | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as EventFormValues) : null;
  } catch {
    return null;
  }
}

function writeDraft(key: string, values: EventFormValues) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // storage full or blocked: nothing else to do
  }
}

function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-4 border-t border-gold/10 pt-6">
    <h2 className="font-display text-xl text-parchment">{title}</h2>
    {children}
  </section>
);

const EventFormPage = () => {
  const { id } = useParams();
  const isNew = !id;
  const { profile, session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<Locale>("ro");
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const slugEdited = useRef(!isNew);
  // New events: the end follows the start until it is changed by hand.
  const endEdited = useRef(!isNew);

  const existing = useQuery({
    queryKey: ["admin", "event", id],
    queryFn: () => fetchEventById(id!),
    enabled: !isNew,
    // Never reload under the editor's hands (e.g. when coming back to the tab).
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: emptyEventForm(),
  });
  const { register, handleSubmit, formState, watch, setValue, setError, reset } = form;
  const errors = formState.errors;

  // Fill the form once per event; later data must not overwrite unsaved edits.
  // An unsaved draft kept in this browser (see below) wins over the stored event.
  const draftKey = `admin:event-draft:${session?.user.id ?? "anon"}:${id ?? "new"}`;
  const filledFor = useRef<string | null>(null);
  const baseline = useRef("");
  useEffect(() => {
    const target = isNew ? "new" : existing.data?.id;
    if (!target || filledFor.current === target) return;
    filledFor.current = target;
    const original = existing.data ? formFromEvent(existing.data) : emptyEventForm();
    baseline.current = snapshot(original);
    const draft = readDraft(draftKey);
    if (draft) {
      slugEdited.current = true;
      reset(original);
      reset(draft, { keepDefaultValues: true });
      toast("Am recuperat textele nesalvate de data trecută.", {
        action: {
          label: "Renunță la ele",
          onClick: () => {
            clearDraft(draftKey);
            slugEdited.current = !isNew;
            reset(original);
          },
        },
      });
    } else {
      reset(original);
    }
  }, [isNew, existing.data, reset, draftKey]);

  // Keep unsaved changes in this browser, so switching tabs, reloading or an
  // accidental close never loses what was typed. Cleared after saving.
  useEffect(() => {
    const subscription = watch((current) => {
      if (!filledFor.current) return;
      if (snapshot(current as EventFormValues) === baseline.current) clearDraft(draftKey);
      else writeDraft(draftKey, current as EventFormValues);
    });
    return () => subscription.unsubscribe();
  }, [watch, draftKey]);

  // New events: the address follows the Romanian title until edited by hand.
  const titleRo = watch("title.ro");
  useEffect(() => {
    if (slugEdited.current) return;
    const next = slugify(titleRo);
    // Only when it really changes: re-validating an unchanged address would wipe
    // an error from the server ("address already used").
    // After a failed save, re-check it so a stale "required" error disappears.
    if (next !== form.getValues("slug")) setValue("slug", next, { shouldValidate: form.formState.isSubmitted });
  }, [titleRo, setValue, form]);

  const values = watch();
  const canEdit =
    isNew || !existing.data || profile?.role === "admin" || existing.data.created_by === profile?.id;

  const onPhoto = async (file: File | undefined) => {
    if (!file || !session) return;
    setUploading(true);
    try {
      const blob = await resizeImage(file);
      const path = await uploadEventImage(blob, session.user.id, values.slug || slugify(values.title.ro));
      setValue("image_path", path, { shouldDirty: true });
      toast.success("Poza a fost încărcată.");
    } catch {
      toast.error("Poza nu a putut fi încărcată. Încearcă altă poză (JPG, PNG sau WebP).");
    } finally {
      setUploading(false);
    }
  };

  // "Fill in from a link": only empty fields are filled, nothing typed is overwritten.
  const prefillFromLink = async (url: string) => {
    let preview: LinkPreview;
    try {
      preview = await fetchLinkPreview(url);
    } catch (e) {
      toast.error(prefillErrorMessage(e));
      return;
    }
    if (!preview.title && !preview.description && !preview.image) {
      toast.error(
        "Pagina nu are informații de previzualizare (de ex. un eveniment Facebook privat sau care cere login). Completează manual.",
      );
      return;
    }
    const current = form.getValues();
    const filled: string[] = [];
    const set = (name: Parameters<typeof setValue>[0], value: string) =>
      setValue(name, value as never, { shouldDirty: true, shouldValidate: formState.isSubmitted });

    if (preview.title && !current.title.ro.trim()) {
      set("title.ro", preview.title);
      filled.push("titlul");
    }
    if (preview.description) {
      const short = shortSummary(preview.description);
      if (!current.summary.ro.trim()) {
        set("summary.ro", short);
        filled.push("descrierea scurtă");
      }
      if (short !== preview.description && !current.content.ro.trim()) {
        set("content.ro", preview.description);
        filled.push("descrierea completă");
      }
    }
    if (!current.external_url.trim()) {
      set("external_url", preview.url || url);
      filled.push("linkul extern");
    }
    if (preview.image && !current.image_path && session) {
      setUploading(true);
      try {
        const blob = await resizeImage(await fetchLinkImage(preview.image));
        const base = form.getValues("slug") || slugify(form.getValues("title.ro"));
        setValue("image_path", await uploadEventImage(blob, session.user.id, base), { shouldDirty: true });
        filled.push("poza");
      } catch {
        toast.error("Poza de pe pagină nu a putut fi preluată; poți alege una manual.");
      } finally {
        setUploading(false);
      }
    }

    if (filled.length) {
      setLanguage("ro");
      toast.success(`Am completat: ${filled.join(", ")}. Verifică textele, apoi alege tipul, data și ora.`);
    } else {
      toast("Câmpurile erau deja completate; nu am schimbat nimic.");
    }
  };

  const onSubmit = handleSubmit(
    async (formValues) => {
      try {
        await saveEvent(eventFromForm(formValues), id);
        clearDraft(draftKey);
        notifyEventsChanged();
        await queryClient.invalidateQueries({ queryKey: ["admin"] });
        await queryClient.invalidateQueries({ queryKey: ["events"] });
        await queryClient.invalidateQueries({ queryKey: ["event"] });
        toast.success(isNew ? "Evenimentul a fost adăugat." : "Modificările au fost salvate.");
        navigate("/admin");
      } catch (e) {
        if (e instanceof SlugTakenError) {
          setError("slug", { message: "Această adresă e deja folosită de alt eveniment. Alege alta." });
        } else if ((e as { code?: string }).code === "PGRST116" || (e as { code?: string }).code === "42501") {
          toast.error("Nu ai dreptul să modifici acest eveniment.");
        } else {
          toast.error("Evenimentul nu a putut fi salvat. Verifică datele și încearcă din nou.");
        }
      }
    },
    (formErrors) => {
      // Jump to the first language tab that has a problem.
      const tab = LANGUAGES.find(
        (lng) => formErrors.title?.[lng] || formErrors.summary?.[lng] || formErrors.content?.[lng],
      );
      if (tab) setLanguage(tab);
      toast.error("Formularul are câmpuri de corectat.");
    },
  );

  if (!isNew && existing.isPending) return <p className="font-body text-muted-foreground">Se încarcă...</p>;
  if (!isNew && (existing.isError || !existing.data)) {
    return (
      <div role="alert">
        <p className="mb-4 font-body text-muted-foreground">Evenimentul nu a fost găsit sau nu ai acces la el.</p>
        <Link to="/admin" className="text-gold underline">
          Înapoi la listă
        </Link>
      </div>
    );
  }
  if (!canEdit) {
    return (
      <div role="alert">
        <p className="mb-4 font-body text-muted-foreground">
          Acest eveniment a fost adăugat de altcineva. Doar autorul sau un administrator îl poate modifica.
        </p>
        <Link to="/admin" className="text-gold underline">
          Înapoi la listă
        </Link>
      </div>
    );
  }

  const imageUrl = eventImageUrl(values.image_path);
  let preview: EventRow | null = null;
  try {
    if (values.title.ro && values.start && values.end && values.type) {
      preview = {
        ...eventFromForm(values),
        id: id ?? "preview",
        created_by: null,
        created_at: "",
        updated_at: "",
      };
    }
  } catch {
    preview = null;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div>
        <Link
          to="/admin"
          className="mb-4 inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Toate evenimentele
        </Link>
        <h1 className="font-display text-3xl text-parchment md:text-4xl">
          {isNew ? "Eveniment nou" : "Editează evenimentul"}
        </h1>
      </div>

      <LinkPrefill onPrefill={prefillFromLink} />

      {/* Texts, one tab per language */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-parchment">Texte</h2>
        <p className="font-body text-sm text-muted-foreground">
          Româna e obligatorie. Pentru celelalte limbi, ce lipsește se afișează automat în română.
        </p>
        <Tabs value={language} onValueChange={(v) => setLanguage(v as Locale)}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-secondary/50">
            {LANGUAGES.map((lng) => {
              const done = values.title[lng].trim() !== "";
              const hasError = Boolean(errors.title?.[lng] || errors.summary?.[lng] || errors.content?.[lng]);
              return (
                <TabsTrigger
                  key={lng}
                  value={lng}
                  className="gap-2 data-[state=active]:bg-background"
                  aria-label={`${LANGUAGE_NAMES[lng]}: ${done ? "tradus" : "lipsește"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${
                      hasError ? "bg-destructive" : done ? "bg-primary" : "border border-muted-foreground"
                    }`}
                  />
                  {lng.toUpperCase()}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {LANGUAGES.map((lng) => (
            <TabsContent key={lng} value={lng} className="space-y-4 pt-2">
              <Field label={`Titlu (${LANGUAGE_NAMES[lng]})${lng === "ro" ? " *" : ""}`} htmlFor={`title-${lng}`} error={errors.title?.[lng]}>
                <input
                  id={`title-${lng}`}
                  className={inputClass}
                  aria-invalid={Boolean(errors.title?.[lng])}
                  {...register(`title.${lng}`)}
                />
              </Field>
              <Field
                label={`Descriere scurtă (${LANGUAGE_NAMES[lng]})`}
                htmlFor={`summary-${lng}`}
                hint="1–2 propoziții, apar pe cardul evenimentului."
                error={errors.summary?.[lng]}
              >
                <textarea
                  id={`summary-${lng}`}
                  rows={3}
                  className={inputClass}
                  aria-invalid={Boolean(errors.summary?.[lng])}
                  {...register(`summary.${lng}`)}
                />
              </Field>
              <Field
                label={`Descriere completă (${LANGUAGE_NAMES[lng]})`}
                htmlFor={`content-${lng}`}
                hint="Program, prețuri, detalii. Rândurile noi se păstrează."
                error={errors.content?.[lng]}
              >
                <textarea
                  id={`content-${lng}`}
                  rows={8}
                  className={inputClass}
                  aria-invalid={Boolean(errors.content?.[lng])}
                  {...register(`content.${lng}`)}
                />
              </Field>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <Section title="Detalii">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tip *" htmlFor="type" error={errors.type}>
            <select id="type" className={inputClass} aria-invalid={Boolean(errors.type)} {...register("type")}>
              <option value="">Alege tipul</option>
              {EVENT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {EVENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Adresa în site *"
            htmlFor="slug"
            hint={`oradeatango.ro/events/${values.slug || "..."}`}
            error={errors.slug}
          >
            <input
              id="slug"
              className={inputClass}
              aria-invalid={Boolean(errors.slug)}
              {...register("slug", { onChange: () => (slugEdited.current = true) })}
            />
          </Field>
          <Field label="Început (ora României) *" htmlFor="start" error={errors.start}>
            <Controller
              control={form.control}
              name="start"
              render={({ field }) => (
                <DateTimePicker
                  id="start"
                  label="Început"
                  value={field.value}
                  invalid={Boolean(errors.start)}
                  onChange={(next) => {
                    field.onChange(next);
                    // The end follows a new start, and is pushed along if the start moves past it.
                    if (!endEdited.current || !values.end || values.end < next) {
                      setValue("end", next, { shouldValidate: formState.isSubmitted });
                    }
                  }}
                />
              )}
            />
          </Field>
          <Field
            label="Sfârșit (ora României) *"
            htmlFor="end"
            hint="Pentru o singură seară poate fi ziua următoare (ex. 02:00)."
            error={errors.end}
          >
            <Controller
              control={form.control}
              name="end"
              render={({ field }) => (
                <DateTimePicker
                  id="end"
                  label="Sfârșit"
                  value={field.value}
                  min={values.start || undefined}
                  invalid={Boolean(errors.end)}
                  onChange={(next) => {
                    endEdited.current = true;
                    field.onChange(next);
                  }}
                />
              )}
            />
          </Field>
          <Field
            label="Link extern"
            htmlFor="external_url"
            hint="Opțional: evenimentul de pe Facebook sau formularul de înscriere."
            error={errors.external_url}
          >
            <input
              id="external_url"
              type="url"
              inputMode="url"
              placeholder="https://"
              className={inputClass}
              aria-invalid={Boolean(errors.external_url)}
              {...register("external_url")}
            />
          </Field>
        </div>
      </Section>

      <Section title="Locație">
        <Field
          label="Numele locului și adresa"
          htmlFor="location"
          hint="Așa apare pe site, ex.: Feeling Dance Studio, Strada Vasile Alecsandri 12, Oradea."
          error={errors.location}
        >
          <input id="location" className={inputClass} {...register("location")} />
        </Field>
        <p className="font-body text-sm text-muted-foreground">
          Opțional, alege locul exact pe hartă: pe site, butonul de locație deschide Google Maps fix în acel punct.
        </p>
        <LocationPicker
          point={values.latitude !== null && values.longitude !== null ? { lat: values.latitude, lng: values.longitude } : null}
          onPointChange={(point) => {
            setValue("latitude", point?.lat ?? null, { shouldDirty: true });
            setValue("longitude", point?.lng ?? null, { shouldDirty: true });
          }}
          query={values.location}
          onPickLabel={(label) => {
            if (!values.location.trim()) setValue("location", label, { shouldDirty: true });
          }}
        />
      </Section>

      <Section title="Poză">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="aspect-[16/9] overflow-hidden rounded-sm bg-secondary">
            <img
              src={imageUrl ?? defaultEventImage}
              alt=""
              className={`h-full w-full object-cover ${imageUrl ? "" : "opacity-40"}`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-gold/40 px-5 py-3 font-body text-sm text-parchment hover:border-gold/70 ${
                uploading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {uploading ? "Se încarcă..." : imageUrl ? "Schimbă poza" : "Alege o poză"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                data-testid="photo-input"
                onChange={(e) => {
                  onPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setValue("image_path", null, { shouldDirty: true })}
                className="flex items-center justify-center gap-2 rounded-sm px-5 py-2 font-body text-sm text-muted-foreground hover:text-foreground"
              >
                <ImageOff className="h-4 w-4" aria-hidden="true" />
                Fără poză
              </button>
            )}
          </div>
        </div>
        <p className="font-body text-xs text-muted-foreground">
          {imageUrl
            ? "Poza e micșorată automat înainte de încărcare."
            : "Fără poză proprie, pe site apare poza implicită (cea estompată de mai sus). Pe telefon poți face și o poză direct."}
        </p>
      </Section>

      <Section title="Publicare">
        <div role="radiogroup" aria-label="Stare" className="inline-flex gap-1 rounded-sm border border-gold/20 p-1">
          {(
            [
              ["draft", "Ciornă"],
              ["published", "Publicat"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={values.status === value}
              onClick={() => setValue("status", value, { shouldDirty: true })}
              className={`rounded-sm px-5 py-2 font-body text-sm transition-colors ${
                values.status === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-body text-xs text-muted-foreground">
          {values.status === "published"
            ? "Evenimentul apare pe site imediat după salvare."
            : "Ciorna o vezi doar tu (și administratorii); nu apare pe site."}
        </p>
      </Section>

      {/* Actions stay reachable at the bottom of the screen on phones */}
      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-gold/10 bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          disabled={!preview}
          className="flex items-center gap-2 rounded-sm border border-gold/40 px-4 py-3 font-body text-sm text-parchment hover:border-gold/70 disabled:opacity-40"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Previzualizare
        </button>
        <button
          type="submit"
          disabled={formState.isSubmitting || uploading}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 font-body text-sm font-medium text-primary-foreground hover:brightness-125 disabled:opacity-60 sm:flex-none"
        >
          {formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isNew ? "Adaugă evenimentul" : "Salvează"}
        </button>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cum apare pe site</DialogTitle>
          </DialogHeader>
          <div className="pointer-events-none" aria-hidden="true">
            {preview && <EventCard event={preview} />}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default EventFormPage;
