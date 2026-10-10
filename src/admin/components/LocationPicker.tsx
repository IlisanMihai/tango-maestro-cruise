import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Search, X } from "lucide-react";

// Free map: OpenStreetMap tiles + Nominatim address search (no account, no key, no cost).
// Nominatim allows light use: one search per click, never per keystroke.
const ORADEA: [number, number] = [47.0465, 21.9189];
const NOMINATIM = "https://nominatim.openstreetmap.org/search";

export interface Point {
  lat: number;
  lng: number;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
}

const pinIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:hsl(var(--primary));border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

/** Short label from a Nominatim result: "Feeling Dance Studio, Strada Vasile Alecsandri 12, Oradea". */
const shortLabel = (r: SearchResult) => r.display_name.split(",").slice(0, 4).join(",").trim();

const LocationPicker = ({
  point,
  onPointChange,
  query,
  onPickLabel,
}: {
  point: Point | null;
  onPointChange: (point: Point | null) => void;
  /** Text typed in the "Location" field, used as the default search. */
  query: string;
  /** Called with the address of a chosen search result. */
  onPickLabel: (label: string) => void;
}) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const onChange = useRef(onPointChange);
  onChange.current = onPointChange;

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create the map once.
  useEffect(() => {
    if (!mapEl.current || map.current) return;
    const m = L.map(mapEl.current, { scrollWheelZoom: false }).setView(point ? [point.lat, point.lng] : ORADEA, point ? 16 : 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => onChange.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker in sync with the form value.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!point) {
      marker.current?.remove();
      marker.current = null;
      return;
    }
    if (!marker.current) {
      marker.current = L.marker([point.lat, point.lng], { icon: pinIcon, draggable: true, keyboard: false }).addTo(m);
      marker.current.on("dragend", () => {
        const at = marker.current!.getLatLng();
        onChange.current({ lat: at.lat, lng: at.lng });
      });
    } else {
      marker.current.setLatLng([point.lat, point.lng]);
    }
  }, [point]);

  const runSearch = async () => {
    const q = (search || query).trim();
    if (!q) return;
    setSearching(true);
    setError(null);
    try {
      const url = new URL(NOMINATIM);
      url.search = new URLSearchParams({
        q,
        format: "jsonv2",
        limit: "5",
        countrycodes: "ro,hu",
        "accept-language": "ro",
        // Prefer Oradea and around, without excluding other places.
        viewbox: "21.80,47.12,22.05,46.99",
      }).toString();
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      setResults((await res.json()) as SearchResult[]);
    } catch {
      setError("Căutarea nu a mers acum. Poți pune punctul direct, cu un click pe hartă.");
      setResults(null);
    } finally {
      setSearching(false);
    }
  };

  const choose = (r: SearchResult) => {
    const next = { lat: Number(r.lat), lng: Number(r.lon) };
    onPointChange(next);
    onPickLabel(shortLabel(r));
    map.current?.setView([next.lat, next.lng], 17);
    setResults(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // do not submit the event form
      runSearch();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Caută adresa pe hartă</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={query || "Ex.: Strada Sovata 1B, Oradea"}
            className="w-full rounded-sm border border-gold/20 bg-secondary/50 py-2.5 pl-9 pr-3 font-body text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={runSearch}
          disabled={searching}
          className="flex items-center gap-2 rounded-sm border border-gold/40 px-4 py-2.5 font-body text-sm text-parchment hover:border-gold/70 disabled:opacity-60"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" aria-hidden="true" />}
          Caută
        </button>
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-destructive">
          {error}
        </p>
      )}
      {results && (
        <ul className="divide-y divide-gold/10 rounded-sm border border-gold/20" aria-label="Rezultate">
          {results.length === 0 && (
            <li className="px-3 py-2 font-body text-sm text-muted-foreground">
              Nu am găsit adresa. Încearcă doar strada și orașul, sau pune punctul cu un click pe hartă.
            </li>
          )}
          {results.map((r) => (
            <li key={`${r.lat},${r.lon}`}>
              <button
                type="button"
                onClick={() => choose(r)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left font-body text-sm text-foreground hover:bg-secondary"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={mapEl}
        data-testid="location-map"
        className="relative z-0 h-64 w-full overflow-hidden rounded-sm border border-gold/20"
        aria-label="Hartă: dă click pentru a pune locul evenimentului"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 font-body text-xs text-muted-foreground">
        <span>
          {point
            ? `Punct ales: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)} (îl poți trage pe hartă)`
            : "Caută adresa sau dă click pe hartă ca să pui locul exact."}
        </span>
        {point && (
          <button
            type="button"
            onClick={() => onPointChange(null)}
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Șterge punctul
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
