import { z } from "zod";

export const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

export const UpsertLogSchema = z.object({
  habitId: z.string().cuid(),
  logDate: DateStringSchema,
  value: z.boolean().nullable(),
});

export const UpsertNoteSchema = z.object({
  logDate: DateStringSchema,
  note: z.string().max(280),
});

export const UpsertWorkoutSessionSchema = z.object({
  logDate: DateStringSchema,
  bodyParts: z.array(z.string()).min(1),
});

export const UpsertBodyMetricSchema = z.object({
  metricDate: DateStringSchema,
  weightKg: z.number().positive().nullable(),
  waistCm: z.number().positive().nullable(),
});

export const LogWeightSchema = z.object({
  metricDate: DateStringSchema,
  weightKg: z.number().positive(),
});

export const CreateHabitSchema = z.object({
  name: z.string().min(1).max(50),
  emoji: z.string().min(1).max(4),
  category: z.enum(["movement", "nutrition", "recovery", "mind"]),
  isMovement: z.boolean(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  avatarEmoji: z.string().min(1).max(4),
  timezone: z.string().min(1),
  goal: z.enum(["LOSE", "GAIN", "MAINTAIN"]),
  heightCm: z.number().positive().nullable(),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  timezone: z.string().min(1),
});
