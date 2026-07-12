"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const { error } = await signIn.email({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });

    if (error) {
      setError("Invalid email or password.");
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
        welcome
        <br />
        back.
      </h1>
      <p className="text-muted mb-[26px] text-[14px]">five taps a day. one year of truth.</p>

      <form onSubmit={handleSubmit} noValidate>
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

        <div className="mb-4">
          <label className="text-muted mb-[6px] block text-[11px] font-bold tracking-widest uppercase">
            password
          </label>
          <input
            name="password"
            type="password"
            placeholder="min 8 characters"
            required
            autoComplete="current-password"
            className="border-line bg-card text-surface placeholder:text-muted/50 focus:border-lav w-full rounded-[16px] border px-[15px] py-[14px] text-[15px] focus:outline-none"
            suppressHydrationWarning
          />
        </div>

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
          {loading ? "logging in…" : "log in ✦"}
        </button>
      </form>

      <p className="text-muted mt-[18px] text-center text-[13.5px]">
        new here?{" "}
        <Link href="/register" className="text-flame-b font-bold">
          create an account
        </Link>
      </p>
    </section>
  );
}
