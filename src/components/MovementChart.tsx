"use client";

import { BarChart, Bar, Cell, ReferenceLine, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { WeeklyMovement } from "@/server/services/stats.service";

export function MovementChart({ data }: { data: WeeklyMovement[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart
        data={data}
        margin={{ top: 6, right: 2, left: -38, bottom: 0 }}
        barCategoryGap="22%"
      >
        <defs>
          <linearGradient id="mvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFC24B" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="weekLabel"
          tick={{ fontSize: 9, fill: "#A79BC8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[0, 7]} hide />

        <ReferenceLine
          y={4}
          stroke="rgba(255,194,75,.6)"
          strokeDasharray="3 3"
          label={{
            value: "goal · 4",
            position: "insideTopRight",
            offset: 6,
            style: { fontSize: 9.5, fill: "#FFC24B" },
          }}
        />

        <Bar dataKey="movementDays" radius={[5, 5, 2, 2]}>
          {data.map((entry) => (
            <Cell key={entry.weekStart} fill={entry.passed ? "url(#mvGrad)" : "#3A3060"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
