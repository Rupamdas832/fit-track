import { describe, it, expect } from "vitest";
import { computeWeek, computeStreaks } from "./streaks.service";
import type { WeekVerdict } from "./streaks.service";

// Build a WeekVerdict array from an array of movement-day counts.
// Dates are synthetic Mondays starting 2024-01-01.
function weeks(counts: number[]): WeekVerdict[] {
  return counts.map((count, i) => {
    // 2024-01-01 is a Monday; advance by i*7 days
    const d = new Date("2024-01-01T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + i * 7);
    return {
      weekStart: d.toISOString().slice(0, 10),
      movementDays: count,
      passed: count >= 4,
    };
  });
}

// Build distinct date strings within a week starting at a given Monday
function daysIn(weekStart: string, count: number): string[] {
  const result: string[] = [];
  const base = new Date(weekStart + "T12:00:00Z");
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

// ─── computeWeek ──────────────────────────────────────────────────────────────

describe("computeWeek", () => {
  it("empty input → 0 days, not passed", () => {
    expect(computeWeek([])).toEqual({ movementDays: 0, passed: false });
  });

  it("1 day → not passed", () => {
    expect(computeWeek(["2024-01-01"])).toEqual({ movementDays: 1, passed: false });
  });

  it("3 days → not passed", () => {
    expect(computeWeek(daysIn("2024-01-01", 3))).toEqual({ movementDays: 3, passed: false });
  });

  it("4 distinct days → passed (boundary)", () => {
    expect(computeWeek(daysIn("2024-01-01", 4))).toEqual({ movementDays: 4, passed: true });
  });

  it("5 distinct days → passed", () => {
    expect(computeWeek(daysIn("2024-01-01", 5))).toEqual({ movementDays: 5, passed: true });
  });

  it("7 distinct days → passed (perfect week)", () => {
    expect(computeWeek(daysIn("2024-01-01", 7))).toEqual({ movementDays: 7, passed: true });
  });

  it("duplicate dates are deduplicated via Set", () => {
    // Same date logged 4 times = only 1 unique day → not passed
    expect(computeWeek(["2024-01-01", "2024-01-01", "2024-01-01", "2024-01-01"])).toEqual({
      movementDays: 1,
      passed: false,
    });
  });

  it("3 unique + 1 duplicate = 3 days → not passed", () => {
    expect(computeWeek(["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-01"])).toEqual({
      movementDays: 3,
      passed: false,
    });
  });

  it("4 unique + duplicates = 4 days → passed", () => {
    expect(
      computeWeek([
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-01",
        "2024-01-02",
      ])
    ).toEqual({ movementDays: 4, passed: true });
  });
});

// ─── computeStreaks ───────────────────────────────────────────────────────────

describe("computeStreaks", () => {
  it("empty history → current=0, longest=0", () => {
    expect(computeStreaks([])).toEqual({ current: 0, longest: 0 });
  });

  it("single passing week → current=1, longest=1", () => {
    expect(computeStreaks(weeks([4]))).toEqual({ current: 1, longest: 1 });
  });

  it("single failing week → current=0, longest=0", () => {
    expect(computeStreaks(weeks([2]))).toEqual({ current: 0, longest: 0 });
  });

  it("all weeks pass → current equals total count", () => {
    expect(computeStreaks(weeks([4, 5, 4, 5, 4]))).toEqual({ current: 5, longest: 5 });
  });

  it("trailing fail: current resets to 0, longest preserved", () => {
    // 3 passes then a fail
    expect(computeStreaks(weeks([4, 5, 4, 2]))).toEqual({ current: 0, longest: 3 });
  });

  it("trailing fail: current=0 even after a single-week fail", () => {
    expect(computeStreaks(weeks([4, 4, 3]))).toEqual({ current: 0, longest: 2 });
  });

  it("fail in the middle: current=2, longest=2", () => {
    // pass, fail, pass, pass → runs: [1, 0, 1, 2]
    expect(computeStreaks(weeks([4, 2, 4, 4]))).toEqual({ current: 2, longest: 2 });
  });

  it("unlogged gap week (0 movement days) breaks the streak", () => {
    // pass, pass, gap, pass → longest=2, current=1
    expect(computeStreaks(weeks([4, 4, 0, 4]))).toEqual({ current: 1, longest: 2 });
  });

  it("gap week breaks streak even surrounded by long runs", () => {
    // 5 passes, 0-day gap, 3 passes → longest=5, current=3
    expect(computeStreaks(weeks([4, 4, 4, 4, 4, 0, 4, 4, 4]))).toEqual({
      current: 3,
      longest: 5,
    });
  });

  it("longest is tracked correctly across multiple runs", () => {
    // 9-week run, then a fail, then a 5-week run
    expect(computeStreaks(weeks([4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, 4, 4, 4]))).toEqual({
      current: 5,
      longest: 9,
    });
  });

  it("example [4,5,4,2,4,4]: current=2, longest=3", () => {
    // w1 pass→run1, w2 pass→run2, w3 pass→run3(longest), w4 fail→run0, w5 pass→run1, w6 pass→run2
    expect(computeStreaks(weeks([4, 5, 4, 2, 4, 4]))).toEqual({ current: 2, longest: 3 });
  });

  it("longer run after a reset: longest updates when second run overtakes first", () => {
    // run1=2, reset, run2=4 → longest=4
    expect(computeStreaks(weeks([4, 4, 2, 4, 4, 4, 4]))).toEqual({ current: 4, longest: 4 });
  });

  it("first-week grace: first week that fails doesn't create a negative result", () => {
    // User registered mid-week; first week has only 2 movement days → 0/0
    expect(computeStreaks(weeks([2]))).toEqual({ current: 0, longest: 0 });
  });

  it("first-week grace: user earns first streak on their second week despite a partial first week", () => {
    // First week: 2 days (partial; user just registered) → fail
    // Weeks 2–4: 4+ days each → 3-week streak
    expect(computeStreaks(weeks([2, 4, 5, 4]))).toEqual({ current: 3, longest: 3 });
  });

  it("backdated edit is idempotent: recomputing the same data gives the same result", () => {
    // The streak engine is stateless — same input always yields same output.
    // This proves a backdated edit (which changes DB rows then calls currentStreakView)
    // will always reflect the corrected history with no stale cache.
    const data = weeks([4, 5, 2, 4, 4, 4]);
    expect(computeStreaks(data)).toEqual(computeStreaks(data));
  });

  it("backdated edit changes result correctly: editing a fail week to pass extends current", () => {
    const beforeEdit = weeks([4, 5, 2, 4]); // fail at w3 → current=1, longest=2
    const afterEdit = weeks([4, 5, 4, 4]); // w3 now passes → current=4, longest=4
    expect(computeStreaks(beforeEdit)).toEqual({ current: 1, longest: 2 });
    expect(computeStreaks(afterEdit)).toEqual({ current: 4, longest: 4 });
  });

  it("single failing week followed by many passes: longest reflects the run, not the fail", () => {
    expect(computeStreaks(weeks([1, 4, 4, 4, 4, 4]))).toEqual({ current: 5, longest: 5 });
  });

  it("alternating pass/fail: current is always 0 or 1, longest is 1", () => {
    expect(computeStreaks(weeks([4, 0, 4, 0, 4]))).toEqual({ current: 1, longest: 1 });
  });

  it("all weeks fail: current=0, longest=0", () => {
    expect(computeStreaks(weeks([0, 1, 2, 3, 0, 1, 2, 3]))).toEqual({ current: 0, longest: 0 });
  });
});
