import { db } from "@/server/db";
import { todayFor, weekStartFor, weekEndFor, addWeeks, addDays } from "@/lib/dates";
import type { DateString } from "@/lib/dates";

export interface WeekVerdict {
  weekStart: DateString;
  movementDays: number;
  passed: boolean;
}

export interface StreakResult {
  current: number;
  longest: number;
}

export interface CalendarDay {
  date: DateString;
  inMonth: boolean;
  hasMovementDone: boolean;
  hasAnyLog: boolean;
  isToday: boolean;
  isFuture: boolean;
  isPreHistory: boolean; // before the user's very first log date
}

export interface CalendarWeek {
  weekStart: DateString;
  days: CalendarDay[];
  verdict: "passed" | "failed" | null; // null = current week, future, or pre-history
}

/** Pure: count distinct movement days in a week and decide if it passes (≥4). */
export function computeWeek(movementLogsForWeek: DateString[]): {
  movementDays: number;
  passed: boolean;
} {
  const movementDays = new Set(movementLogsForWeek).size;
  return { movementDays, passed: movementDays >= 4 };
}

/** Pure: compute current and longest streak from an ordered slice of week verdicts. */
export function computeStreaks(weeklyVerdicts: WeekVerdict[]): StreakResult {
  let run = 0;
  let longest = 0;

  for (const week of weeklyVerdicts) {
    if (week.passed) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }

  return { current: run, longest };
}

/**
 * DB-touching wrapper: loads all movement logs, groups by week, and computes
 * streaks over every completed Mon–Sun week from the user's first log to now.
 * The current (incomplete) week is never judged — only its movement-day count
 * is returned for the header progress chip.
 */
export async function currentStreakView(
  userId: string,
  timezone: string
): Promise<StreakResult & { movementDaysThisWeek: number }> {
  const today = todayFor(timezone);
  const thisWeekStart = weekStartFor(today);

  const firstLog = await db.dailyLog.findFirst({
    where: { userId, value: true, habit: { isMovement: true } },
    orderBy: { logDate: "asc" },
  });

  if (!firstLog) return { current: 0, longest: 0, movementDaysThisWeek: 0 };

  const movementLogs = await db.dailyLog.findMany({
    where: { userId, value: true, habit: { isMovement: true } },
    select: { logDate: true },
  });

  // Group log dates by their week's Monday
  const byWeek = new Map<string, string[]>();
  for (const { logDate } of movementLogs) {
    const wk = weekStartFor(logDate);
    byWeek.set(wk, [...(byWeek.get(wk) ?? []), logDate]);
  }

  // Progress within the current incomplete week
  const thisWeekLogs = byWeek.get(thisWeekStart) ?? [];
  const movementDaysThisWeek = new Set(thisWeekLogs).size;

  // Enumerate every completed week from the first-log week up to (not including) this week.
  // String cursor avoids Date object timezone pitfalls entirely.
  const firstWeekStart = weekStartFor(firstLog.logDate);
  const verdicts: WeekVerdict[] = [];
  let cursor = firstWeekStart;

  while (cursor < thisWeekStart) {
    const logs = byWeek.get(cursor) ?? [];
    const { movementDays, passed } = computeWeek(logs);
    verdicts.push({ weekStart: cursor, movementDays, passed });
    cursor = addWeeks(cursor, 1);
  }

  return { ...computeStreaks(verdicts), movementDaysThisWeek };
}

/**
 * Returns the Mon–Sun weeks that cover the given calendar month, with per-day
 * metadata (shading state) and a week verdict for each completed week.
 * Weeks are Mon–Sun; padding days from adj months are included for a full grid.
 */
export async function getCalendarMonth(
  userId: string,
  timezone: string,
  year: number,
  month: number // 1–12
): Promise<{ weeks: CalendarWeek[]; canGoForward: boolean }> {
  const today = todayFor(timezone);
  const thisWeekStart = weekStartFor(today);

  // Month bounds as strings
  const mm = String(month).padStart(2, "0");
  const firstOfMonth = `${year}-${mm}-01`;
  // day 0 of (month+1) in UTC = last day of this month
  const lastDayNum = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastOfMonth = `${year}-${mm}-${String(lastDayNum).padStart(2, "0")}`;

  // Expand to full Mon–Sun week boundaries for the grid
  const gridStart = weekStartFor(firstOfMonth);
  const gridEnd = weekEndFor(lastOfMonth);

  // User's earliest log date (for pre-history detection)
  const firstLog = await db.dailyLog.findFirst({
    where: { userId },
    orderBy: { logDate: "asc" },
    select: { logDate: true },
  });
  const firstLogDate = firstLog?.logDate ?? null;
  const firstLogWeek = firstLogDate ? weekStartFor(firstLogDate) : null;

  // All log rows in the visible grid range
  const logs = await db.dailyLog.findMany({
    where: { userId, logDate: { gte: gridStart, lte: gridEnd } },
    select: {
      logDate: true,
      value: true,
      habit: { select: { isMovement: true } },
    },
  });

  // Aggregate per day: hasMovementDone, hasAnyLog
  const dayMeta = new Map<string, { hasMovementDone: boolean; hasAnyLog: boolean }>();
  for (const log of logs) {
    const m = dayMeta.get(log.logDate) ?? { hasMovementDone: false, hasAnyLog: false };
    dayMeta.set(log.logDate, {
      hasMovementDone: m.hasMovementDone || (log.habit.isMovement && log.value),
      hasAnyLog: true,
    });
  }

  // Build week rows
  const weeks: CalendarWeek[] = [];
  let cursor = gridStart;

  while (cursor <= gridEnd) {
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));

    const days: CalendarDay[] = weekDates.map((date) => {
      const m = dayMeta.get(date);
      return {
        date,
        inMonth: date >= firstOfMonth && date <= lastOfMonth,
        hasMovementDone: m?.hasMovementDone ?? false,
        hasAnyLog: m?.hasAnyLog ?? false,
        isToday: date === today,
        isFuture: date > today,
        isPreHistory: !!firstLogDate && date < firstLogDate,
      };
    });

    // Verdict: only for completed weeks within the user's logging history
    let verdict: "passed" | "failed" | null = null;
    if (cursor < thisWeekStart && firstLogWeek && cursor >= firstLogWeek) {
      const movementDates = days.filter((d) => d.hasMovementDone).map((d) => d.date);
      verdict = computeWeek(movementDates).passed ? "passed" : "failed";
    }

    weeks.push({ weekStart: cursor, days, verdict });
    cursor = addWeeks(cursor, 1);
  }

  // Can go forward only if we're not already viewing the current month
  const thisMonthStr = `${year}-${mm}`;
  const currentMonthStr = today.slice(0, 7);
  const canGoForward = thisMonthStr < currentMonthStr;

  return { weeks, canGoForward };
}
