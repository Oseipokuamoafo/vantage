/**
 * Ten-segment 0–10 meter. Every value uses the same neutral ink so no score looks "better";
 * the segments make the number easy to read at a glance.
 */
export function ScoreMeter({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(10, value));
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="tabular w-9 shrink-0 text-lg font-bold leading-none text-ink"
        aria-hidden="true"
      >
        {v.toFixed(1)}
      </span>
      <span className="sr-only">
        {label}: {v.toFixed(1)} out of 10
      </span>
      <span className="flex w-full min-w-[80px] gap-[3px]" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, v - i));
          return (
            <span
              key={i}
              className="relative h-2.5 flex-1 overflow-hidden rounded-[3px] bg-paper-sunk"
            >
              <span
                className="absolute inset-y-0 left-0 bg-ink-soft transition-[width] duration-500 ease-out"
                style={{ width: `${fill * 100}%` }}
              />
            </span>
          );
        })}
      </span>
    </div>
  );
}
