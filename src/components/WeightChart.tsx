"use client";

import { ComposedChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { WeightDataPoint } from "@/server/services/stats.service";

export function WeightChart({ data }: { data: WeightDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={90}>
      <ComposedChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="wtGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B69CFF" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
        </defs>

        <XAxis dataKey="date" hide />
        <YAxis domain={["auto", "auto"]} hide />

        {/* Actual weigh-in dots: invisible line, visible dots */}
        <Line
          type="linear"
          dataKey="weightKg"
          stroke="transparent"
          strokeWidth={0}
          dot={{ fill: "#4A3F73", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: "#B69CFF", strokeWidth: 0 }}
          isAnimationActive={false}
        />

        {/* 7-point rolling average: gradient stroke, no dots */}
        <Line
          type="monotone"
          dataKey="rollingAvg"
          stroke="url(#wtGrad)"
          strokeWidth={3.5}
          dot={false}
          strokeLinecap="round"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
