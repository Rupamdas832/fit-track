import { db } from "@/server/db";
import type { Goal } from "@prisma/client";

export async function updateUserProfile(
  userId: string,
  data: {
    name: string;
    avatarEmoji: string;
    timezone: string;
    goal: Goal;
    heightCm: number | null;
  }
) {
  return db.user.update({ where: { id: userId }, data });
}

export async function exportUserData(userId: string) {
  const [user, habits, logs, notes, workoutSessions, metrics, earned] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        timezone: true,
        goal: true,
        heightCm: true,
        avatarEmoji: true,
      },
    }),
    db.habit.findMany({ where: { userId } }),
    db.dailyLog.findMany({ where: { userId }, orderBy: { logDate: "asc" } }),
    db.dailyNote.findMany({ where: { userId }, orderBy: { logDate: "asc" } }),
    db.workoutSession.findMany({ where: { userId }, orderBy: { logDate: "asc" } }),
    db.bodyMetric.findMany({ where: { userId }, orderBy: { metricDate: "asc" } }),
    db.badgeEarned.findMany({ where: { userId } }),
  ]);

  return {
    user,
    habits,
    logs,
    notes,
    workoutSessions,
    metrics,
    earned,
    exportedAt: new Date().toISOString(),
  };
}

export async function deleteUserAccount(userId: string) {
  await db.user.delete({ where: { id: userId } });
}
