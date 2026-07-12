"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [timezone] = useState(() =>
    typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const { error } = await signUp.email({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      // @ts-expect-error — additional fields passed through Better Auth
      timezone,
    });

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    } else {
      router.push("/today");
    }
  }

  return (
    <section className="flex flex-1 flex-col justify-center px-6 py-7">
      <div className="font-display mb-[26px] text-[22px] font-black tracking-tight">
        fit
        <span className="from-flame-a to-flame-b bg-gradient-to-r bg-clip-text text-transparent">
          track
        </span>
      </div>

      <h1 className="font-display mb-2 text-[28px] leading-tight font-bold tracking-tight">
        start your
        <br />
        first week.
      </h1>
      <p className="text-muted mb-[26px] text-[14px]">
        your five habits are ready the moment you join.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="text-muted mb-[6px] block text-[11px] font-bold tracking-widest uppercase">
            name
          </label>
          <input
            name="name"
            type="text"
            placeholder="what should we call you?"
            required
            autoComplete="name"
            className="border-line bg-card text-surface placeholder:text-muted/50 focus:border-lav w-full rounded-[16px] border px-[15px] py-[14px] text-[15px] focus:outline-none"
            suppressHydrationWarning
          />
        </div>

        <div className="mb-3">
          <label className="text-muted mb-[6px] block text-[11px] font-bold tracking-widest uppercase">
            email
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="border-line bg-card text-surface placeholder:text-muted/50 focus:border-lav w-full rounded-[16px] border px-[15px] py-[14px] text-[15px] focus:outline-none"
            suppressHydrationWarning
          />
        </div>

        <div className="mb-2">
          <label className="text-muted mb-[6px] block text-[11px] font-bold tracking-widest uppercase">
            password
          </label>
          <input
            name="password"
            type="password"
            placeholder="min 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            className="border-line bg-card text-surface placeholder:text-muted/50 focus:border-lav w-full rounded-[16px] border px-[15px] py-[14px] text-[15px] focus:outline-none"
            suppressHydrationWarning
          />
        </div>

        <p className="text-muted mb-[14px] text-[11.5px]">
          🌏 timezone auto-detected: <strong className="text-surface">{timezone}</strong> — your
          days &amp; streaks follow it
        </p>

        {error && (
          <p className="bg-rose/10 text-rose mb-4 rounded-xl px-3 py-2 text-[13px]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="font-display w-full rounded-[20px] border-none py-[17px] text-[14px] font-bold text-[#160F26] shadow-[0_8px_28px_rgba(255,107,53,.35)] transition-transform active:scale-[.98] disabled:opacity-60"
          style={{ background: "linear-gradient(90deg,#FF6B35,#FFC24B)" }}
          suppressHydrationWarning
        >
          {loading ? "creating account…" : "create account ✦"}
        </button>
      </form>

      <p className="text-muted mt-[18px] text-center text-[13.5px]">
        already tracking?{" "}
        <Link href="/login" className="text-flame-b font-bold">
          log in
        </Link>
      </p>
    </section>
  );
}
