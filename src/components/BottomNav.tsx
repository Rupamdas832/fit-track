"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/today", icon: "✦", label: "today" },
  { href: "/streaks", icon: "🔥", label: "streaks" },
  { href: "/progress", icon: "📈", label: "progress" },
  { href: "/recap", icon: "💌", label: "recap" },
  { href: "/profile", icon: "👤", label: "profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-line absolute right-0 bottom-0 left-0 flex border-t pt-[10px] pb-[calc(14px+env(safe-area-inset-bottom))]"
      style={{
        background: "rgba(19,16,32,.85)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {TABS.map(({ href, icon, label }) => {
        const active = pathname === href || (href === "/today" && pathname === "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-[3px] text-[10px] font-medium transition-colors ${
              active ? "text-surface" : "text-muted"
            }`}
          >
            <span
              className={`text-[20px] leading-none transition-all ${
                active ? "-translate-y-px" : "opacity-55 grayscale"
              }`}
            >
              {icon}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
