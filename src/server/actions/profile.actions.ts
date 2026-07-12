"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth";
import {
  updateUserProfile,
  exportUserData,
  deleteUserAccount,
} from "@/server/services/user.service";
import { UpdateProfileSchema } from "@/lib/zod-schemas";
import type { Goal } from "@prisma/client";

export async function updateProfileAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireUser();

  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
    avatarEmoji: formData.get("avatarEmoji"),
    timezone: formData.get("timezone"),
    goal: formData.get("goal"),
    heightCm: formData.get("heightCm") ? Number(formData.get("heightCm")) : null,
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input.";
  }

  await updateUserProfile(user.id, {
    ...parsed.data,
    goal: parsed.data.goal as Goal,
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return null;
}

export async function updateGoalAction(goal: Goal): Promise<void> {
  const user = await requireUser();
  await updateUserProfile(user.id, {
    name: user.name,
    avatarEmoji: user.avatarEmoji,
    timezone: user.timezone,
    goal,
    heightCm: user.heightCm,
  });
  revalidatePath("/profile");
}

export async function exportDataAction(): Promise<string> {
  const user = await requireUser();
  const data = await exportUserData(user.id);
  return JSON.stringify(data, null, 2);
}

export async function deleteAccountAction(): Promise<void> {
  const user = await requireUser();
  await deleteUserAccount(user.id);
  redirect("/login");
}
