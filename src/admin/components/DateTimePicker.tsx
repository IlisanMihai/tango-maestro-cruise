import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, h) => pad(h));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));
const DEFAULT_TIME = "20:00";

const selectClass =
  "rounded-sm border border-gold/20 bg-secondary/50 px-2 py-2.5 font-body text-base text-foreground focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive";

/** "2026-12-05" -> local Date for the calendar (wall-clock only, no time zone maths). */
const toDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Date and time in Romanian time, as "YYYY-MM-DDTHH:mm":
 * a calendar for the day plus two short lists for hour and minutes.
 */
const DateTimePicker = ({
  id,
  label,
  value,
  onChange,
  invalid,
  min,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  /** Earliest allowed value ("YYYY-MM-DDTHH:mm"): earlier days, hours and minutes are disabled. */
  min?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [day, time] = value ? value.split("T") : ["", ""];
  const [hour, minute] = (time || "").split(":");
  const selected = day ? toDate(day) : undefined;
  // Keep an unusual minute (e.g. 49 from an older event) selectable.
  const minutes = minute && !MINUTES.includes(minute) ? [...MINUTES, minute].sort() : MINUTES;
  const [minDay, minTime] = min ? min.split("T") : ["", ""];
  const [minHour, minMinute] = (minTime || "").split(":");
  const sameDayAsMin = Boolean(minDay) && day === minDay;
  // Never emit a value before `min` (same-format strings compare chronologically).
  const emit = (next: string) => onChange(min && next < min ? min : next);

  const setDay = (date: Date | undefined) => {
    if (!date) return;
    const nextDay = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    emit(`${nextDay}T${time || DEFAULT_TIME}`);
    setOpen(false);
  };
  const setTime = (nextHour: string, nextMinute: string) => {
    emit(`${day || minDay || format(new Date(), "yyyy-MM-dd")}T${nextHour}:${nextMinute}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby={`${id}-label`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-invalid={invalid}
            aria-label={`${label}: ${selected ? format(selected, "EEEE, d MMMM yyyy", { locale: ro }) : "alege data"}`}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-gold/20 bg-secondary/50 px-3 py-2.5 text-left font-body text-base text-foreground hover:border-gold/50 focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive"
          >
            <CalendarDays className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <span className={`truncate first-letter:uppercase ${selected ? "" : "text-muted-foreground"}`}>
              {selected ? format(selected, "EEEE, d MMMM yyyy", { locale: ro }) : "Alege data"}
            </span>
          </button>
        </PopoverTrigger>
        {/* On short screens (phone held sideways) the calendar scrolls inside the visible area. */}
        <PopoverContent
          className="max-h-[var(--radix-popover-content-available-height)] w-auto overflow-y-auto border-gold/20 p-0"
          align="start"
          collisionPadding={8}
        >
          <Calendar
            mode="single"
            locale={ro}
            weekStartsOn={1}
            selected={selected}
            defaultMonth={selected ?? (minDay ? toDate(minDay) : new Date())}
            disabled={minDay ? { before: toDate(minDay) } : undefined}
            onSelect={setDay}
            labels={{
              labelNext: () => "Luna următoare",
              labelPrevious: () => "Luna anterioară",
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center gap-1">
        <select
          aria-label={`${label}: ora`}
          className={selectClass}
          aria-invalid={invalid}
          value={hour ?? ""}
          onChange={(e) => setTime(e.target.value, minute || "00")}
        >
          {!hour && <option value="">--</option>}
          {HOURS.map((h) => (
            <option key={h} value={h} disabled={sameDayAsMin && h < minHour}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground">:</span>
        <select
          aria-label={`${label}: minutele`}
          className={selectClass}
          aria-invalid={invalid}
          value={minute ?? ""}
          onChange={(e) => setTime(hour || DEFAULT_TIME.slice(0, 2), e.target.value)}
        >
          {!minute && <option value="">--</option>}
          {minutes.map((m) => (
            <option key={m} value={m} disabled={sameDayAsMin && hour === minHour && m < minMinute}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DateTimePicker;
