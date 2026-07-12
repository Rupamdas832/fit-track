"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import { createHabit, archiveHabit, unarchiveHabit } from "@/server/services/habits.service";
import { CreateHabitSchema } from "@/lib/zod-schemas";

export async function createHabitAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireUser();

  const parsed = CreateHabitSchema.safeParse({
    name: formData.get("name"),
    emoji: formData.get("emoji"),
    category: formData.get("category"),
    isMovement: formData.get("isMovement") === "true",
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input.";
  }

  await createHabit(user.id, parsed.data);
  revalidatePath("/profile");
  revalidatePath("/today");
  return null;
}

export async function archiveHabitAction(habitId: string): Promise<void> {
  const user = await requireUser();
  await archiveHabit(user.id, habitId);
  revalidatePath("/profile");
  revalidatePath("/today");
}

export async function unarchiveHabitAction(habitId: string): Promise<void> {
  const user = await requireUser();
  await unarchiveHabit(user.id, habitId);
  revalidatePath("/profile");
  revalidatePath("/today");
}
