"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import { upsertBodyMetric } from "@/server/services/body-metrics.service";
import { LogWeightSchema } from "@/lib/zod-schemas";
import { isFuture } from "@/lib/dates";

export async function logWeightAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireUser();

  const parsed = LogWeightSchema.safeParse({
    metricDate: formData.get("metricDate"),
    weightKg: Number(formData.get("weightKg")),
  });

  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";
  if (isFuture(parsed.data.metricDate, user.timezone)) return "Cannot log a future date.";

  await upsertBodyMetric(user.id, parsed.data.metricDate, parsed.data.weightKg);
  revalidatePath("/profile");
  revalidatePath("/progress");
  return null;
}
