import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Link2, Loader2 } from "lucide-react";

/**
 * "Fill in from a link": paste the address of the event page (Facebook,
 * a festival site...), and the form takes its title, description and photo.
 */
const LinkPrefill = ({ onPrefill }: { onPrefill: (url: string) => Promise<void> }) => {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!url.trim() || busy) return;
    setBusy(true);
    try {
      await onPrefill(url.trim());
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // not the event form's submit
      run();
    }
  };

  return (
    <section className="space-y-2 rounded-sm border border-dashed border-gold/30 p-4">
      <label htmlFor="prefill-url" className="flex items-center gap-2 font-body text-sm font-medium text-parchment">
        <Link2 className="h-4 w-4 text-gold" aria-hidden="true" />
        Completează din link (opțional)
      </label>
      <p className="font-body text-xs text-muted-foreground">
        Lipește linkul paginii evenimentului (ex. evenimentul de pe Facebook) și preiau titlul, descrierea și poza. Data,
        ora și tipul le alegi tu.
      </p>
      <div className="flex gap-2">
        <input
          id="prefill-url"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 rounded-sm border border-gold/20 bg-secondary/50 px-3 py-2.5 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => run()}
          disabled={busy || !url.trim()}
          className="flex items-center gap-2 rounded-sm border border-gold/40 px-4 py-2.5 font-body text-sm text-parchment hover:border-gold/70 disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Preia datele
        </button>
      </div>
    </section>
  );
};

export default LinkPrefill;
