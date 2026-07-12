export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-dvh w-full max-w-[412px] flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 50% at 85% -8%, rgba(182,156,255,.14), transparent 60%), radial-gradient(90% 40% at 0% 110%, rgba(255,107,53,.10), transparent 60%), #131020",
      }}
    >
      {children}
    </div>
  );
}
