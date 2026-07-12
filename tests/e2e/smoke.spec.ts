import { test, expect } from "@playwright/test";

/**
 * Compute the Monday of the last *completed* Mon–Sun week.
 * "Completed" means the whole week (Mon–Sun) has passed, i.e., today is at
 * least the Monday of the following week.
 *
 * e.g. if today is Wednesday 2026-07-15 (week Jul 13–19), the last completed
 * week started Monday 2026-07-06.
 */
function lastWeekMonday(): Date {
  const today = new Date();
  // getDay(): 0=Sun 1=Mon … 6=Sat → normalise to Mon=0 … Sun=6
  const iso = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
  // Days back to this week's Monday, then another 7 to last week's Monday
  const daysBack = iso + 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysBack);
  return monday;
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

test.describe("FitTrack smoke", () => {
  test("register → log 4 movement days in a completed week → streak = 1", async ({ page }) => {
    const email = `smoke-${Date.now()}@example.com`;

    // ── 1. Register ──────────────────────────────────────────────────────────
    await page.goto("/register");
    await page.locator('[name="name"]').fill("Smoke User");
    await page.locator('[name="email"]').fill(email);
    await page.locator('[name="password"]').fill("password123!");
    await page.locator('[type="submit"]').click();
    await page.waitForURL("/today", { timeout: 40_000 });

    // ── 2. Pick Mon–Thu of last completed week ────────────────────────────────
    const mon = lastWeekMonday();
    const movementDates = [0, 1, 2, 3].map((offset) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + offset);
      return toDateString(d);
    });

    // ── 3. Log "Workout" (isMovement=true) on each of the 4 days ─────────────
    for (const date of movementDates) {
      await page.goto(`/today?date=${date}`);

      // Wait for habit tiles to render
      const workoutTile = page.locator("button[aria-pressed]").filter({ hasText: "Workout" });
      await workoutTile.waitFor({ timeout: 10_000 });

      // Cycle: null → true (done ✓)
      await workoutTile.click();
      await expect(workoutTile).toHaveAttribute("aria-pressed", "true", {
        timeout: 8_000,
      });
    }

    // ── 4. Verify streak = 1 on /streaks ─────────────────────────────────────
    await page.goto("/streaks");

    // The hero card structure is: <div><span>{number}</span><p>{label}</p></div>
    // Navigate up from the label <p> to the card <div>, then grab its first <span>.
    const currentStreakLabel = page
      .locator("p")
      .filter({ hasText: /current streak/i })
      .first();
    const heroNumber = currentStreakLabel.locator("xpath=..").locator("span").first();

    await expect(heroNumber).toHaveText("1", { timeout: 10_000 });

    // Also confirm the calendar shows a 🔥 verdict for that week
    await expect(page.locator("text=🔥").first()).toBeVisible();
  });
});
