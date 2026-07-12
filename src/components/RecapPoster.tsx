"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { WeekRecap } from "@/server/services/recap.service";

const POSTER_BG = "linear-gradient(160deg,#FF6B35 0%,#FF4E6A 45%,#B69CFF 100%)";
const POSTER_FG = "#1B0F22";
const DIVIDER = "1.5px solid rgba(27,15,34,.18)";

export function RecapPoster({ recap }: { recap: WeekRecap }) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!posterRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 2 });
      if (typeof navigator.share === "function" && typeof navigator.canShare === "function") {
        const blob = await fetch(dataUrl).then((r) => r.blob());
        const file = new File([blob], `fittrack-wk${recap.weekNumber}.png`, {
          type: "image/png",
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "FitTrack Week Recap" });
          return;
        }
      }
      const a = document.createElement("a");
      a.download = `fittrack-wk${recap.weekNumber}.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      // share cancelled or failed
    } finally {
      setSharing(false);
    }
  }

  const headlineLines = recap.headline.split("\n");

  return (
    <>
      {/* Poster — all inline styles so html-to-image captures correctly */}
      <div
        ref={posterRef}
        style={{
          background: POSTER_BG,
          color: POSTER_FG,
          borderRadius: 30,
          padding: "26px 22px",
          position: "relative",
          overflow: "hidden",
          marginBottom: 14,
          fontFamily: "var(--font-body, 'Space Grotesk', sans-serif)",
        }}
      >
        {/* Sheen overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(80% 50% at 100% 0%,rgba(255,255,255,.35),transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(27,15,34,.65)",
              marginBottom: 4,
            }}
          >
            fittrack · {recap.dateRange}
          </div>

          {/* Headline */}
          <h2
            style={{
              fontFamily: "var(--font-display, 'Unbounded', sans-serif)",
              fontWeight: 900,
              fontSize: 26,
              lineHeight: 1.15,
              margin: "4px 0 16px",
              color: POSTER_FG,
            }}
          >
            {headlineLines[0]}
            {headlineLines[1] && (
              <>
                <br />
                {headlineLines[1]}
              </>
            )}
          </h2>

          {/* Habit rows */}
          {recap.habits.map((h, i) => (
            <div
              key={h.habitId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderTop: i === 0 ? DIVIDER : undefined,
                borderBottom: DIVIDER,
                fontSize: 14,
                fontWeight: 500,
                color: POSTER_FG,
              }}
            >
              <span>
                {h.emoji} {h.name}
              </span>
              <b style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{h.done}</b>
            </div>
          ))}

          {/* Streak row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 0",
              borderBottom: DIVIDER,
              fontSize: 14,
              fontWeight: 500,
              color: POSTER_FG,
            }}
          >
            <span>🔥 streak</span>
            <b style={{ fontWeight: 700 }}>
              {recap.currentStreak} week{recap.currentStreak !== 1 ? "s" : ""}
              {recap.isRecord ? " — record" : ""}
            </b>
          </div>

          {/* Note row — only if present */}
          {recap.note && (
            <div
              style={{
                padding: "9px 0",
                borderBottom: DIVIDER,
                fontSize: 12,
                fontStyle: "italic",
                color: "rgba(27,15,34,.7)",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              &quot;{recap.note}&quot;
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: 14,
              fontSize: 10.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(27,15,34,.6)",
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {recap.highlight}
            </span>
            <span style={{ flexShrink: 0 }}>wk {recap.weekNumber}</span>
          </div>
        </div>
      </div>

      {/* Share button — outside the poster so it's not captured */}
      <button
        onClick={handleShare}
        disabled={sharing}
        className="border-line bg-card w-full rounded-[18px] border py-[15px] text-[14px] font-bold transition-opacity disabled:opacity-60"
      >
        {sharing ? "preparing…" : "share recap ↗"}
      </button>
    </>
  );
}
