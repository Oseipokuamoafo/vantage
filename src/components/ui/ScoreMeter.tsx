/** 0–10 bar: blue fill on a pale-blue track, numeric score in navy. Same color for every value (no "better" color). */
export function ScoreMeter({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(10, value));
  return (
    <div className="flex items-center gap-3">
      <span
        className="tabular w-10 shrink-0 text-lg font-extrabold leading-none text-navy"
        aria-hidden="true"
      >
        {v.toFixed(1)}
      </span>
      <span className="sr-only">
        {label}: {v.toFixed(1)} out of 10
      </span>
      <span
        className="relative h-2.5 w-full min-w-[80px] overflow-hidden rounded-full bg-tint"
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-brand"
          style={{ width: `${v * 10}%` }}
        />
      </span>
    </div>
  );
}
