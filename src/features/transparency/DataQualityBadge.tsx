import { Badge } from '../../components/ui';
import type { DataQuality } from '../../data/types';
import { DATA_QUALITY } from './dataQuality';

export function DataQualityBadge({ quality }: { quality: DataQuality }) {
  const q = DATA_QUALITY[quality];
  return (
    <Badge tone={q.tone}>
      <span className="sr-only">Data quality: </span>
      <span title={q.description}>{q.label}</span>
    </Badge>
  );
}

export function DataQualityLegend() {
  return (
    <details className="disclosure rounded-xl border border-line bg-paper-raised p-3 text-sm transition-colors hover:border-line-strong">
      <summary className="font-semibold">Data-quality labels explained</summary>
      <dl className="mt-3 space-y-2">
        {Object.entries(DATA_QUALITY).map(([key, q]) => (
          <div key={key} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
            <dt className="shrink-0 sm:w-32">
              <Badge tone={q.tone}>{q.label}</Badge>
            </dt>
            <dd className="text-ink-soft">{q.description}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-ink-muted">
        All content in this prototype is sample data. None of it is labelled “Sourced” until the
        team verifies it.
      </p>
    </details>
  );
}
