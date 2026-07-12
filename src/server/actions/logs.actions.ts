"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import { upsertLog, upsertNote, upsertWorkoutSession } from "@/server/services/logs.service";
import { evaluateAndAwardBadges } from "@/server/services/milestones.service";
import { UpsertLogSchema, UpsertNoteSchema, UpsertWorkoutSessionSchema } from "@/lib/zod-schemas";
import { isFuture } from "@/lib/dates";

export async function upsertLogAction(
  habitId: string,
  logDate: string,
  value: boolean | null
): Promise<void> {
  const user = await requireUser();

  const parsed = UpsertLogSchema.safeParse({ habitId, logDate, value });
  if (!parsed.success) throw new Error("Invalid input");

  if (isFuture(logDate, user.timezone)) throw new Error("Cannot log future dates");

  await upsertLog(user.id, habitId, logDate, value);
  await evaluateAndAwardBadges(user.id, logDate, user.timezone).catch(() => {});
  revalidatePath("/today");
  revalidatePath("/streaks");
  revalidatePath("/progress");
}

export async function upsertNoteAction(logDate: string, note: string): Promise<void> {
  const user = await requireUser();

  const parsed = UpsertNoteSchema.safeParse({ logDate, note });
  if (!parsed.success) throw new Error("Invalid input");

  if (isFuture(logDate, user.timezone)) throw new Error("Cannot log future dates");

  await upsertNote(user.id, logDate, note);
  revalidatePath("/today");
}

export async function upsertWorkoutSessionAction(
  logDate: string,
  bodyParts: string[]
): Promise<void> {
  const user = await requireUser();

  const parsed = UpsertWorkoutSessionSchema.safeParse({ logDate, bodyParts });
  if (!parsed.success) throw new Error("Invalid input");

  if (isFuture(logDate, user.timezone)) throw new Error("Cannot log future dates");

  await upsertWorkoutSession(user.id, logDate, bodyParts);
  revalidatePath("/today");
}
