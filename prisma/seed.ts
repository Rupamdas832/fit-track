import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export const DEFAULT_HABITS = [
  { name: "Workout", emoji: "🏋️", category: "movement", isMovement: true, sortOrder: 0 },
  { name: "Yoga / Walking", emoji: "🧘", category: "movement", isMovement: true, sortOrder: 1 },
  { name: "Junk skipped", emoji: "🥗", category: "nutrition", isMovement: false, sortOrder: 2 },
  { name: "Slept 7+ hrs", emoji: "😴", category: "recovery", isMovement: false, sortOrder: 3 },
  { name: "Study & research", emoji: "📚", category: "mind", isMovement: false, sortOrder: 4 },
] as const;

const BADGE_DEFS = [
  {
    code: "first_step",
    name: "First Step",
    description: "Log your very first habit",
    rule: { type: "total_logs", threshold: 1 },
    isSecret: false,
  },
  {
    code: "the_first_fifty",
    name: "The First Fifty",
    description: "50 total workouts",
    rule: { type: "total_workouts", threshold: 50 },
    isSecret: false,
  },
  {
    code: "century_club",
    name: "Century Club",
    description: "100 total workouts",
    rule: { type: "total_workouts", threshold: 100 },
    isSecret: false,
  },
  {
    code: "iron_quarter",
    name: "Iron Quarter",
    description: "13-week streak",
    rule: { type: "streak_weeks", threshold: 13 },
    isSecret: false,
  },
  {
    code: "half_year_human",
    name: "Half-Year Human",
    description: "26-week streak",
    rule: { type: "streak_weeks", threshold: 26 },
    isSecret: false,
  },
  {
    code: "clean_month",
    name: "Clean Month",
    description: "≥90% junk-skipped in a calendar month",
    rule: { type: "monthly_rate", habitName: "Junk skipped", threshold: 0.9 },
    isSecret: false,
  },
  {
    code: "sleep_architect",
    name: "Sleep Architect",
    description: "30 nights of 7+ hrs sleep",
    rule: { type: "total_habit_logs", habitName: "Slept 7+ hrs", threshold: 30 },
    isSecret: false,
  },
  {
    code: "early_bird",
    name: "Early Bird",
    description: "Secret badge — keep going",
    rule: { type: "secret" },
    isSecret: true,
  },
];

async function main() {
  console.log("Seeding database…");

  for (const badge of BADGE_DEFS) {
    await db.badgeDef.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
  }
  console.log(`✓ ${BADGE_DEFS.length} badge definitions`);

  // Per-user default habits are seeded at registration time by
  // src/server/services/habits.service.ts — not here.

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
