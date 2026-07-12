import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { requireUser } from "@/server/auth";
import { currentStreakView } from "@/server/services/streaks.service";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const streak = await currentStreakView(user.id, user.timezone);

  return (
    <div
      className="relative flex min-h-dvh w-full max-w-[412px] flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 50% at 85% -8%, rgba(182,156,255,.14), transparent 60%), radial-gradient(90% 40% at 0% 110%, rgba(255,107,53,.10), transparent 60%), #131020",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-[18px] pt-[18px]">
        <div className="font-display text-[15px] font-black tracking-tight">
          fit
          <span className="from-flame-a to-flame-b bg-gradient-to-r bg-clip-text text-transparent">
            track
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="border-line bg-card flex items-center gap-[5px] rounded-full border px-3 py-[6px] text-[13px] font-bold">
            🔥 <span>{streak.current}</span> <small className="text-muted font-medium">wks</small>
          </div>
          <div className="border-line bg-card flex items-center gap-[5px] rounded-full border px-3 py-[6px] text-[13px] font-bold">
            🏆 <span>{streak.longest}</span> <small className="text-muted font-medium">best</small>
          </div>
          <Link
            href="/profile"
            className="border-line bg-card grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-xl border text-[17px]"
            aria-label="Profile"
          >
            {user.avatarEmoji}
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto px-[18px] pt-5 pb-[110px]">{children}</main>

      <BottomNav />
    </div>
  );
}
