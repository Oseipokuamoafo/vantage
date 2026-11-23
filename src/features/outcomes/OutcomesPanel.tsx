import { useOutcomes, useSettings } from '../../data/content';
import { DataQualityBadge } from '../transparency';
import { outcomesFor } from './outcomes';

export function OutcomesPanel({
  opportunityId,
  goalTypeId,
}: {
  opportunityId: string;
  goalTypeId: string;
}) {
  const records = useOutcomes();
  const { minOutcomeSampleSize } = useSettings();
  const view = outcomesFor(records, opportunityId, goalTypeId, minOutcomeSampleSize);

  if (view.status !== 'available') {
    return (
      <div className="space-y-1 text-sm" data-testid="outcomes-empty">
        <p className="font-semibold text-ink">No data yet</p>
        <p className="text-ink-soft">
          {view.status === 'below_minimum'
            ? `Fewer than ${view.minimum} students reported outcomes for this path (largest group: ${view.largestSample}), so figures are hidden.`
            : `No outcome reports for this path yet. Figures appear once at least ${view.minimum} students report.`}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 text-sm" data-testid="outcomes-available">
      {view.records.map((r) => (
        <li key={r.id} className="space-y-1">
          <p className="text-ink">
            <span className="font-semibold tabular-nums">{Math.round(r.outcomeRate * 100)}%</span>{' '}
            {r.metric.charAt(0).toLowerCase() + r.metric.slice(1)}
          </p>
          <p className="text-ink-muted">
            n = {r.sampleSize} · {r.cohort}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-ink-muted">
            <DataQualityBadge quality={r.dataQuality} />
            <span>Source: {r.source}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
