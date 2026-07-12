import { db } from "@/server/db";
import { todayFor, weekStartFor, weekDatesFor } from "@/lib/dates";
import type { DateString } from "@/lib/dates";

export async function getLogsForDate(userId: string, logDate: DateString) {
  return db.dailyLog.findMany({
    where: { userId, logDate },
    include: { habit: true },
  });
}

export async function getDailyNote(userId: string, logDate: DateString) {
  return db.dailyNote.findUnique({
    where: { userId_logDate: { userId, logDate } },
  });
}

export async function getWorkoutSession(userId: string, logDate: DateString) {
  return db.workoutSession.findUnique({
    where: { userId_logDate: { userId, logDate } },
  });
}

export async function getLastWorkoutSession(userId: string) {
  return db.workoutSession.findFirst({
    where: { userId },
    orderBy: { logDate: "desc" },
  });
}

export async function getWeekStripData(userId: string, timezone: string) {
  const today = todayFor(timezone);
  const weekStart = weekStartFor(today);
  const dates = weekDatesFor(weekStart);

  const [movementLogs, anyLogs] = await Promise.all([
    db.dailyLog.findMany({
      where: { userId, logDate: { in: dates }, value: true, habit: { isMovement: true } },
      select: { logDate: true },
    }),
    db.dailyLog.findMany({
      where: { userId, logDate: { in: dates } },
      select: { logDate: true },
      distinct: ["logDate"],
    }),
  ]);

  const movedDates = new Set(movementLogs.map((l) => l.logDate));
  const loggedDates = new Set(anyLogs.map((l) => l.logDate));

  return {
    days: dates.map((date) => ({
      date,
      hasFire: movedDates.has(date),
      hasLog: loggedDates.has(date),
      isToday: date === today,
    })),
    movementDaysThisWeek: movedDates.size,
  };
}

export async function upsertLog(
  userId: string,
  habitId: string,
  logDate: DateString,
  value: boolean | null
) {
  if (value === null) {
    await db.dailyLog.deleteMany({ where: { habitId, logDate, userId } });
    return null;
  }
  return db.dailyLog.upsert({
    where: { habitId_logDate: { habitId, logDate } },
    update: { value, updatedAt: new Date() },
    create: { userId, habitId, logDate, value },
  });
}

export async function upsertNote(userId: string, logDate: DateString, note: string) {
  if (!note.trim()) {
    await db.dailyNote.deleteMany({ where: { userId, logDate } });
    return null;
  }
  return db.dailyNote.upsert({
    where: { userId_logDate: { userId, logDate } },
    update: { note },
    create: { userId, logDate, note },
  });
}

export async function upsertWorkoutSession(
  userId: string,
  logDate: DateString,
  bodyParts: string[]
) {
  if (!bodyParts.length) {
    await db.workoutSession.deleteMany({ where: { userId, logDate } });
    return null;
  }
  return db.workoutSession.upsert({
    where: { userId_logDate: { userId, logDate } },
    update: { bodyParts },
    create: { userId, logDate, bodyParts },
  });
}
