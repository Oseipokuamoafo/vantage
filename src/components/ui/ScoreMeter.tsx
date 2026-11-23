/** Neutral 0–10 meter. The same color is used for every value so no score looks "better". */
export function ScoreMeter({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(10, value)) * 10;
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-9 shrink-0 text-right font-semibold tabular-nums text-ink"
        aria-hidden="true"
      >
        {value.toFixed(1)}
      </span>
      <span className="sr-only">
        {label}: {value.toFixed(1)} out of 10
      </span>
      <span
        className="relative h-2 w-full min-w-[64px] overflow-hidden rounded-full bg-paper-sunk"
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-ink-soft"
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}
