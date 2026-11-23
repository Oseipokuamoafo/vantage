import type { DataQuality } from '../../data/types';
import { DATA_QUALITY } from './dataQuality';

// Distinct by icon and outline style as well as color: sourced = blue check, limited = amber info,
// team estimate = gray dashed outline.
const STYLE: Record<DataQuality, string> = {
  sourced: 'border-primary/50 bg-tint text-primary-active',
  limited: 'border-amber-line bg-amber-soft text-amber',
  team_estimate: 'border-dashed border-border-strong bg-surface text-body',
};

function QualityIcon({ quality }: { quality: DataQuality }) {
  if (quality === 'sourced')
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path
          d="M4.8 8.3 7 10.4l4.2-4.6"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (quality === 'limited')
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 7.2v4M8 4.8v.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
      <circle
        cx="8"
        cy="8"
        r="6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="2.6 2.2"
      />
    </svg>
  );
}

export function DataQualityBadge({ quality }: { quality: DataQuality }) {
  const q = DATA_QUALITY[quality];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-0.5 text-xs font-semibold leading-5 ${STYLE[quality]}`}
      title={q.description}
    >
      <QualityIcon quality={quality} />
      <span className="sr-only">Data quality: </span>
      {q.label}
    </span>
  );
}

export function DataQualityLegend() {
  return (
    <details className="disclosure rounded-2xl border border-border bg-surface px-4 py-3 text-sm shadow-soft">
      <summary className="font-semibold text-navy">Data-quality labels explained</summary>
      <dl className="mt-3 space-y-2.5">
        {(Object.keys(DATA_QUALITY) as DataQuality[]).map((key) => (
          <div key={key} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
            <dt className="shrink-0 sm:w-36">
              <DataQualityBadge quality={key} />
            </dt>
            <dd className="text-body">{DATA_QUALITY[key].description}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-muted">
        All content in this prototype is sample data. None of it is labelled “Sourced” until the
        team verifies it.
      </p>
    </details>
  );
}
