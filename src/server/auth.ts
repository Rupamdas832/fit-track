import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { seedDefaultHabits } from "./services/habits.service";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      avatarEmoji: { type: "string", defaultValue: "💪", input: false },
      timezone: { type: "string", defaultValue: "UTC", input: true },
      goal: { type: "string", defaultValue: "MAINTAIN", input: false },
      heightCm: { type: "number", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await seedDefaultHabits(user.id);
        },
      },
    },
  },
  baseURL:
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"] & {
  avatarEmoji: string;
  timezone: string;
  goal: string;
  heightCm: number | null;
};

export async function requireUser(): Promise<AuthUser> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  return session.user as AuthUser;
}
