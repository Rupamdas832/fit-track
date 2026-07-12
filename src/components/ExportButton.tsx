"use client";

import { useState } from "react";
import { exportDataAction } from "@/server/actions/profile.actions";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const json = await exportDataAction();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fittrack-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="border-line bg-card text-surface w-full rounded-[18px] border py-[15px] text-[14px] font-bold transition-opacity active:opacity-70 disabled:opacity-50"
    >
      {loading ? "preparing…" : "export my data (JSON) ⬇"}
    </button>
  );
}
