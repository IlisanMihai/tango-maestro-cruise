// The admin form edits dates as Romanian wall-clock time ("2026-11-07T21:00"),
// whatever the editor's device time zone; the database stores UTC.
import { EVENT_TIME_ZONE } from "@/lib/events";

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function wallClockParts(date: Date) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** UTC ISO string -> "YYYY-MM-DDTHH:mm" in Romanian time (for <input type="datetime-local">). */
export function toBucharestInput(iso: string): string {
  const p = wallClockParts(new Date(iso));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** "YYYY-MM-DDTHH:mm" in Romanian time -> UTC ISO string. */
export function fromBucharestInput(value: string): string {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) throw new Error(`Invalid date: ${value}`);
  const [, y, mo, d, h, mi] = m.map(Number);
  const wanted = Date.UTC(y, mo - 1, d, h, mi);
  // Start from "as if UTC" and correct by the zone offset; twice handles DST edges.
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const p = wallClockParts(new Date(guess));
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    guess += wanted - shown;
  }
  return new Date(guess).toISOString();
}
