import { formatInTimeZone } from "date-fns-tz";
import { startOfWeek, endOfWeek, format } from "date-fns";

export type DateString = string; // 'YYYY-MM-DD'

export function todayFor(timezone: string): DateString {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

export function weekStartFor(date: DateString): DateString {
  const zonedDate = new Date(date + "T00:00:00");
  const weekStart = startOfWeek(zonedDate, { weekStartsOn: 1 }); // Monday
  return format(weekStart, "yyyy-MM-dd");
}

export function weekEndFor(date: DateString): DateString {
  const zonedDate = new Date(date + "T00:00:00");
  const weekEnd = endOfWeek(zonedDate, { weekStartsOn: 1 }); // Sunday
  return format(weekEnd, "yyyy-MM-dd");
}

export function isFuture(date: DateString, timezone: string): boolean {
  return date > todayFor(timezone);
}

export function formatDisplayDate(date: DateString): string {
  const d = new Date(date + "T00:00:00");
  return format(d, "MMM d");
}

export function getDayName(date: DateString): string {
  const d = new Date(date + "T00:00:00");
  return format(d, "EEEE").toLowerCase();
}

// Advances a date string by N days using UTC noon to avoid DST boundary issues
export function addDays(dateStr: DateString, days: number): DateString {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Advances a date string by N weeks using UTC noon to avoid DST boundary issues
export function addWeeks(dateStr: DateString, weeks: number): DateString {
  return addDays(dateStr, weeks * 7);
}

export function weekDatesFor(weekStart: DateString): DateString[] {
  const dates: DateString[] = [];
  const start = new Date(weekStart + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(format(d, "yyyy-MM-dd"));
  }
  return dates;
}
