import { db } from "@/server/db";
import { todayFor, weekStartFor, addWeeks } from "@/lib/dates";
import { computeWeek } from "./streaks.service";
import { getISOWeek } from "date-fns";
import type { DateString } from "@/lib/dates";

export interface WeeklyMovement {
  weekStart: DateString;
  weekLabel: string; // "w28"
  movementDays: number;
  passed: boolean;
}

export interface HabitRate {
  habitId: string;
  name: string;
  emoji: string;
  done: number;
  logged: number;
}

export interface WeightDataPoint {
  date: DateString;
  weightKg: number;
  rollingAvg: number;
}

/** Returns the last `count` completed Mon–Sun weeks of movement data for the bar chart. */
export async function getMovementWeeks(
  userId: string,
  timezone: string,
  count = 12
): Promise<WeeklyMovement[]> {
  const today = todayFor(timezone);
  const thisWeekStart = weekStartFor(today);
  const rangeStart = addWeeks(thisWeekStart, -count);

  const logs = await db.dailyLog.findMany({
    where: {
      userId,
      value: true,
      habit: { isMovement: true },
      logDate: { gte: rangeStart, lt: thisWeekStart },
    },
    select: { logDate: true },
  });

  const byWeek = new Map<string, string[]>();
  for (const { logDate } of logs) {
    const wk = weekStartFor(logDate);
    byWeek.set(wk, [...(byWeek.get(wk) ?? []), logDate]);
  }

  const result: WeeklyMovement[] = [];
  let cursor = rangeStart;

  while (cursor < thisWeekStart) {
    const weekLogs = byWeek.get(cursor) ?? [];
    const { movementDays, passed } = computeWeek(weekLogs);
    const isoWeek = getISOWeek(new Date(cursor + "T12:00:00Z"));
    result.push({ weekStart: cursor, weekLabel: `w${isoWeek}`, movementDays, passed });
    cursor = addWeeks(cursor, 1);
  }

  return result;
}

/**
 * Per-habit done/logged rates for the current calendar month.
 * Uses done ÷ logged, never done ÷ days-in-month — absence is not failure.
 */
export async function getHabitMonthlyRates(userId: string, timezone: string): Promise<HabitRate[]> {
  const today = todayFor(timezone);
  const monthStart = today.slice(0, 7) + "-01";

  const [habits, logs] = await Promise.all([
    db.habit.findMany({
      where: { userId, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.dailyLog.findMany({
      where: { userId, logDate: { gte: monthStart, lte: today } },
      select: { habitId: true, value: true },
    }),
  ]);

  const byHabit = new Map<string, { done: number; logged: number }>();
  for (const log of logs) {
    const e = byHabit.get(log.habitId) ?? { done: 0, logged: 0 };
    byHabit.set(log.habitId, { done: e.done + (log.value ? 1 : 0), logged: e.logged + 1 });
  }

  return habits.map((h) => {
    const { done = 0, logged = 0 } = byHabit.get(h.id) ?? {};
    return { habitId: h.id, name: h.name, emoji: h.emoji, done, logged };
  });
}

/** All weigh-ins for the user (up to 52), with a 7-point rolling average. */
export async function getWeightTrend(userId: string): Promise<WeightDataPoint[]> {
  const metrics = await db.bodyMetric.findMany({
    where: { userId, weightKg: { not: null } },
    orderBy: { metricDate: "asc" },
    take: 52,
    select: { metricDate: true, weightKg: true },
  });

  if (metrics.length === 0) return [];

  return metrics.map((m, i) => {
    const window = metrics.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((s, w) => s + (w.weightKg ?? 0), 0) / window.length;
    return { date: m.metricDate, weightKg: m.weightKg!, rollingAvg: parseFloat(avg.toFixed(1)) };
  });
}

/** Pure: trailing run of consecutive passing weeks → callout string, or null if run < 2. */
export function getConsistencyCallout(weeks: WeeklyMovement[]): string | null {
  let run = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i].passed) run++;
    else break;
  }
  if (run < 2) return null;
  return `🌱 ${run} straight weeks at 4+ days — keep going!`;
}

/** Pure: goal-aware weight change caption. */
export function getWeightCallout(data: WeightDataPoint[], goal: string): string | null {
  if (data.length < 2) return null;
  const delta = data[data.length - 1].weightKg - data[0].weightKg;
  const n = data.length;
  const sign = delta > 0 ? "+" : "";
  const kg = `${sign}${delta.toFixed(1)} kg`;

  if (goal === "GAIN") {
    return delta > 0
      ? `↗ ${kg} in ${n} weigh-ins — on your lean-gain pace`
      : `→ ${kg} — add more calories on training days`;
  }
  if (goal === "LOSE") {
    return delta < 0
      ? `↘ ${kg} in ${n} weigh-ins — great progress`
      : `→ ${kg} — stay consistent, results take time`;
  }
  return `→ ${kg} over ${n} weigh-ins — stable`;
}
