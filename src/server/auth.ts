import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { seedDefaultHabits } from "./services/habits.service";

function resolveBaseUrl(): string {
  // Explicit override wins
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // Vercel sets these automatically — no manual env var required
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function resolveTrustedOrigins(): string[] {
  const origins = new Set<string>();
  origins.add(resolveBaseUrl());
  // Also trust the current deployment URL on Vercel (covers preview deploys)
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return Array.from(origins);
}

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
  baseURL: resolveBaseUrl(),
  trustedOrigins: resolveTrustedOrigins(),
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
