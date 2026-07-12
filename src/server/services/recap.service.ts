import { db } from "@/server/db";
import { todayFor, weekStartFor, weekEndFor, addWeeks } from "@/lib/dates";
import { computeWeek, currentStreakView } from "@/server/services/streaks.service";
import { getISOWeek } from "date-fns";
import { format } from "date-fns";
import type { DateString } from "@/lib/dates";

export interface HabitWeekRecap {
  habitId: string;
  name: string;
  emoji: string;
  done: number;
}

export interface WeekRecap {
  weekStart: DateString;
  weekEnd: DateString;
  weekNumber: number;
  dateRange: string;
  habits: HabitWeekRecap[];
  movementDays: number;
  passed: boolean;
  currentStreak: number;
  isRecord: boolean;
  headline: string;
  highlight: string;
  note: string | null;
}

export async function getLastWeekRecap(
  userId: string,
  timezone: string
): Promise<WeekRecap | null> {
  const today = todayFor(timezone);
  const thisWeekStart = weekStartFor(today);
  const weekStart = addWeeks(thisWeekStart, -1);
  const weekEnd = weekEndFor(weekStart);

  const [habits, logs, notes, streakView] = await Promise.all([
    db.habit.findMany({
      where: { userId, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.dailyLog.findMany({
      where: { userId, logDate: { gte: weekStart, lte: weekEnd } },
      include: { habit: { select: { isMovement: true } } },
    }),
    db.dailyNote.findMany({
      where: { userId, logDate: { gte: weekStart, lte: weekEnd }, note: { not: "" } },
      orderBy: { logDate: "desc" },
    }),
    currentStreakView(userId, timezone),
  ]);

  if (logs.length === 0) return null;

  const doneCounts = new Map<string, number>();
  const movementDates = new Set<string>();
  for (const log of logs) {
    if (log.value) {
      doneCounts.set(log.habitId, (doneCounts.get(log.habitId) ?? 0) + 1);
      if (log.habit.isMovement) movementDates.add(log.logDate);
    }
  }

  const { movementDays, passed } = computeWeek(Array.from(movementDates));

  const habitRecaps: HabitWeekRecap[] = habits.map((h) => ({
    habitId: h.id,
    name: h.name,
    emoji: h.emoji,
    done: doneCounts.get(h.id) ?? 0,
  }));

  const weekNumber = getISOWeek(new Date(weekStart + "T12:00:00Z"));
  const dateRange = `${format(new Date(weekStart + "T12:00:00Z"), "MMM d")} – ${format(new Date(weekEnd + "T12:00:00Z"), "MMM d")}`;
  const note = notes[0]?.note ?? null;

  return {
    weekStart,
    weekEnd,
    weekNumber,
    dateRange,
    habits: habitRecaps,
    movementDays,
    passed,
    currentStreak: streakView.current,
    isRecord: streakView.current > 0 && streakView.current === streakView.longest,
    headline: headline(movementDays, passed),
    highlight: highlight(habitRecaps, movementDays),
    note,
  };
}

function headline(movementDays: number, passed: boolean): string {
  if (movementDays >= 6) return "you\ncrushed it.";
  if (passed) return "you\nshowed up.";
  if (movementDays >= 2) return "you\ntried.";
  return "fresh start\nmonday.";
}

function highlight(habits: HabitWeekRecap[], movementDays: number): string {
  if (movementDays === 7) return "★ perfect movement week — all 7 days";
  const perfect = habits.find((h) => h.done === 7);
  if (perfect) return `★ ${perfect.name.toLowerCase()} every single day`;
  const workout = habits.find((h) => h.name.toLowerCase().includes("workout"));
  if (workout && workout.done >= 5) return `★ ${workout.done} workouts this week`;
  const junk = habits.find((h) => h.name.toLowerCase().includes("junk"));
  if (junk && junk.done >= 6) return "★ junk skipped almost every day";
  const sleep = habits.find(
    (h) => h.name.toLowerCase().includes("slept") || h.name.toLowerCase().includes("sleep")
  );
  if (sleep && sleep.done >= 6) return "★ solid sleep discipline this week";
  if (movementDays >= 4) return `★ ${movementDays} movement days — week complete`;
  return "★ showing up is half the battle";
}
