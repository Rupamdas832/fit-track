import { db } from "@/server/db";

export const DEFAULT_HABITS = [
  { name: "Workout", emoji: "🏋️", category: "movement", isMovement: true, sortOrder: 0 },
  { name: "Yoga / Walking", emoji: "🧘", category: "movement", isMovement: true, sortOrder: 1 },
  { name: "Junk skipped", emoji: "🥗", category: "nutrition", isMovement: false, sortOrder: 2 },
  { name: "Slept 7+ hrs", emoji: "😴", category: "recovery", isMovement: false, sortOrder: 3 },
  { name: "Study & research", emoji: "📚", category: "mind", isMovement: false, sortOrder: 4 },
] as const;

export async function getActiveHabits(userId: string) {
  return db.habit.findMany({
    where: { userId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllHabits(userId: string) {
  return db.habit.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }],
  });
}

export async function createHabit(
  userId: string,
  data: { name: string; emoji: string; category: string; isMovement: boolean }
) {
  const { _max } = await db.habit.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });
  return db.habit.create({
    data: { userId, sortOrder: (_max.sortOrder ?? -1) + 1, ...data },
  });
}

export async function archiveHabit(userId: string, habitId: string) {
  return db.habit.updateMany({
    where: { id: habitId, userId },
    data: { isActive: false },
  });
}

export async function unarchiveHabit(userId: string, habitId: string) {
  return db.habit.updateMany({
    where: { id: habitId, userId },
    data: { isActive: true },
  });
}

export async function seedDefaultHabits(userId: string) {
  await db.habit.createMany({
    data: DEFAULT_HABITS.map((h) => ({ ...h, userId })),
    skipDuplicates: true,
  });
}
