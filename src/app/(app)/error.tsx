"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="mb-2 text-[32px]">⚠️</p>
      <h2 className="font-display mb-1 text-[18px] font-bold">something went wrong</h2>
      <p className="text-muted mb-6 max-w-[240px] text-[13px]">
        {error.message || "An unexpected error occurred. Your data is safe."}
      </p>
      <button
        onClick={reset}
        className="border-line bg-card rounded-[16px] border px-6 py-[12px] text-[13px] font-bold transition-opacity active:opacity-70"
      >
        try again
      </button>
    </div>
  );
}
