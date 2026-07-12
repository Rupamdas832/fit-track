export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="bg-card mb-1 h-7 w-40 rounded-xl" />
      <div className="bg-line mb-[18px] h-4 w-52 rounded" />
      <div className="bg-card mb-[14px] h-[180px] rounded-[26px]" />
      <div className="bg-card mb-[14px] h-[140px] rounded-[26px]" />
      <div className="bg-card h-[120px] rounded-[26px]" />
    </div>
  );
}
