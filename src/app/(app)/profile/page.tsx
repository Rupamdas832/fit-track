import { requireUser } from "@/server/auth";
import { getAllHabits } from "@/server/services/habits.service";
import { archiveHabitAction, unarchiveHabitAction } from "@/server/actions/habits.actions";
import { GoalSegment } from "@/components/GoalSegment";
import { EditProfileForm } from "@/components/EditProfileForm";
import { AddHabitForm } from "@/components/AddHabitForm";
import { ExportButton } from "@/components/ExportButton";
import { SignOutButton } from "@/components/SignOutButton";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import type { Goal } from "@prisma/client";

export default async function ProfilePage() {
  const user = await requireUser();
  const habits = await getAllHabits(user.id);

  const active = habits.filter((h) => h.isActive);
  const archived = habits.filter((h) => !h.isActive);

  return (
    <>
      <h1 className="font-display mb-1 text-[22px] leading-tight font-bold tracking-tight">
        profile
      </h1>
      <p className="text-muted mb-[18px] text-[14px]">your app, your rules</p>

      {/* Identity card */}
      <div className="border-line bg-card mb-[14px] rounded-[26px] border p-4">
        <div className="flex items-center gap-[14px]">
          <div
            className="grid h-[64px] w-[64px] flex-none place-items-center rounded-[22px] text-[32px]"
            style={{ background: "linear-gradient(135deg,#FF6B35,#FFC24B)" }}
          >
            {user.avatarEmoji}
          </div>
          <div>
            <b className="block text-[18px]">{user.name}</b>
            <small className="text-muted text-[12.5px]">
              {user.email} · {user.timezone} 🌏
            </small>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="border-line bg-card mb-[14px] rounded-[26px] border p-4">
        <h3 className="text-muted mb-3 text-[13px] font-bold tracking-widest uppercase">
          edit profile
        </h3>
        <EditProfileForm user={user} />
      </div>

      {/* Goal */}
      <div className="border-line bg-card mb-[14px] rounded-[26px] border p-4">
        <h3 className="text-muted mb-3 text-[13px] font-bold tracking-widest uppercase">goal</h3>
        <GoalSegment current={user.goal as Goal} />
        <p className="text-muted mt-[10px] text-[12px]">
          changes how your weight trend is read — nothing else judges you
        </p>
      </div>

      {/* Habits */}
      <div className="border-line bg-card mb-[14px] rounded-[26px] border p-4">
        <h3 className="text-muted mb-3 text-[13px] font-bold tracking-widest uppercase">habits</h3>

        {active.map((h) => (
          <div
            key={h.id}
            className="border-line flex items-center gap-3 border-b py-[10px] last:border-none"
          >
            <span className="w-[34px] text-[19px]">{h.emoji}</span>
            <span className="flex-1 text-[14px] font-medium">{h.name}</span>
            {h.isMovement && (
              <span className="bg-flame-a/14 text-flame-b rounded-full px-[9px] py-1 text-[9.5px] font-bold tracking-[.08em] uppercase">
                streak
              </span>
            )}
            <form
              action={async () => {
                "use server";
                await archiveHabitAction(h.id);
              }}
            >
              <button
                type="submit"
                className="border-line text-muted hover:border-rose/40 hover:text-rose rounded-[10px] border px-[10px] py-[6px] text-[11px] transition-colors"
              >
                archive
              </button>
            </form>
          </div>
        ))}

        {archived.length > 0 && (
          <>
            <p className="text-muted/60 mt-4 mb-2 text-[11px] tracking-widest uppercase">
              archived
            </p>
            {archived.map((h) => (
              <div
                key={h.id}
                className="border-line flex items-center gap-3 border-b py-[10px] opacity-50 last:border-none"
              >
                <span className="w-[34px] text-[19px]">{h.emoji}</span>
                <span className="flex-1 text-[14px] font-medium">{h.name}</span>
                <form
                  action={async () => {
                    "use server";
                    await unarchiveHabitAction(h.id);
                  }}
                >
                  <button
                    type="submit"
                    className="border-line text-muted rounded-[10px] border px-[10px] py-[6px] text-[11px]"
                  >
                    restore
                  </button>
                </form>
              </div>
            ))}
          </>
        )}

        <AddHabitForm />
        <p className="text-muted mt-2 text-[11.5px]">
          archived habits keep their history · &quot;streak&quot; habits count toward movement days
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-[10px]">
        <ExportButton />
        <SignOutButton />
        <DeleteAccountButton />
      </div>
    </>
  );
}
