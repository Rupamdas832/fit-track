import { db } from "@/server/db";
import { currentStreakView } from "./streaks.service";

export interface MilestoneProgress {
  code: string;
  name: string;
  description: string;
  isSecret: boolean;
  earnedOn: string | null;
  progress: number | null;
  target: number | null;
}

export async function getMilestones(
  userId: string,
  timezone: string
): Promise<MilestoneProgress[]> {
  const [badges, earned, workoutCount, totalLogCount, sleepCount] = await Promise.all([
    db.badgeDef.findMany({ orderBy: [{ isSecret: "asc" }, { code: "asc" }] }),
    db.badgeEarned.findMany({ where: { userId } }),
    db.dailyLog.count({ where: { userId, value: true, habit: { name: "Workout" } } }),
    db.dailyLog.count({ where: { userId, value: true } }),
    db.dailyLog.count({ where: { userId, value: true, habit: { name: "Slept 7+ hrs" } } }),
  ]);

  const earnedMap = new Map(earned.map((e) => [e.badgeCode, e.earnedOn]));
  const { current: streakCurrent } = await currentStreakView(userId, timezone);

  return badges.map((badge) => {
    const earnedOn = earnedMap.get(badge.code) ?? null;
    const rule = badge.rule as Record<string, unknown>;

    let progress: number | null = null;
    let target: number | null = null;

    if (rule.type === "total_workouts") {
      progress = workoutCount;
      target = rule.threshold as number;
    } else if (rule.type === "streak_weeks") {
      progress = streakCurrent;
      target = rule.threshold as number;
    } else if (rule.type === "total_logs") {
      progress = totalLogCount;
      target = rule.threshold as number;
    } else if (rule.type === "total_habit_logs") {
      if ((rule.habitName as string) === "Slept 7+ hrs") {
        progress = sleepCount;
        target = rule.threshold as number;
      }
    }
    // monthly_rate and secret badges: progress stays null (no progress bar)

    return {
      code: badge.code,
      name: badge.name,
      description: badge.description,
      isSecret: badge.isSecret,
      earnedOn,
      progress,
      target,
    };
  });
}

/** Called after each log write to auto-award newly unlocked badges. */
export async function evaluateAndAwardBadges(
  userId: string,
  today: string,
  timezone: string
): Promise<void> {
  const milestones = await getMilestones(userId, timezone);

  for (const m of milestones) {
    if (m.earnedOn) continue;
    if (m.progress !== null && m.target !== null && m.progress >= m.target) {
      await db.badgeEarned
        .create({ data: { userId, badgeCode: m.code, earnedOn: today } })
        .catch(() => {}); // unique constraint: ignore if already awarded
    }
  }
}
