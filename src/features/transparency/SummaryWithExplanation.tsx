import { ScoreMeter } from '../../components/ui';
import { ATTRIBUTE_LABELS, type FitStatus, type ScoreResult } from '../scoring';
import { DataQualityBadge } from './DataQualityBadge';

const FIT_LABEL: Record<FitStatus, { text: string; className: string; icon: string }> = {
  fits: {
    text: 'Fits',
    className: 'border-primary/50 bg-tint text-primary-active',
    icon: 'M4.8 8.3 7 10.4l4.2-4.6',
  },
  tight: {
    text: 'Tight',
    className: 'border-amber-line bg-amber-soft text-amber',
    icon: 'M8 4.6v4.2M8 11.2v.2',
  },
  exceeds: {
    text: 'Exceeds',
    className: 'border-danger/60 bg-danger-soft text-danger',
    icon: 'M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2',
  },
};

export function FitStatusBadge({ status }: { status: FitStatus }) {
  const f = FIT_LABEL[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-[1.5px] px-2 py-0.5 text-xs font-semibold leading-5 ${f.className}`}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d={f.icon}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {f.text}
    </span>
  );
}

/** Weighted summary plus which attribute drove it. Constraint fit is shown separately below it. */
export function SummaryWithExplanation({
  result,
  goalName,
}: {
  result: ScoreResult;
  goalName: string;
}) {
  return (
    <div className="space-y-1.5" data-testid="weighted-summary">
      <p className="text-sm font-bold text-navy">Weighted summary</p>
      <ScoreMeter value={result.weightedSummary} label={`Weighted summary for ${goalName}`} />
      <p className="text-sm text-ink-soft">
        <span className="font-medium text-ink">Driven by:</span>{' '}
        {ATTRIBUTE_LABELS[result.primaryDriver]}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <DataQualityBadge quality={result.dataQuality} />
      </div>
      <details className="disclosure rounded-2xl bg-tint p-3 text-sm">
        <summary className="font-semibold text-primary underline-offset-4 hover:underline">
          How this is calculated
        </summary>
        <div className="mt-2 space-y-1 text-ink-soft">
          <p>{result.primaryDriverReason}</p>
          <p>
            Summary = time × {Math.round(result.weights.time * 100)}% + skill ×{' '}
            {Math.round(result.weights.skill * 100)}% + signaling ×{' '}
            {Math.round(result.weights.signaling * 100)}%. Weightings come from the goal and can be
            edited by the content team.
          </p>
        </div>
      </details>
    </div>
  );
}

export function FitPanel({ result }: { result: ScoreResult }) {
  if (!result.fit) {
    return (
      <p className="text-sm text-ink-muted">
        Add your constraints to see how this fits your hours, budget and timeline.
      </p>
    );
  }
  const { fit } = result;
  return (
    <div className="space-y-2" data-testid="constraint-fit">
      <p className="text-sm font-bold text-navy">Constraint fit (separate from the rating)</p>
      <ul className="space-y-1.5">
        {fit.adjustments.map((a) => (
          <li key={a.constraint} className="text-sm">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{a.label}</span>
              <FitStatusBadge status={a.status} />
              {a.delta !== 0 && (
                <span className="tabular-nums text-ink-muted">{a.delta.toFixed(1)}</span>
              )}
            </span>
            <span className="text-ink-soft">{a.note}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-soft">
        With fit adjustments:{' '}
        <span className="font-semibold tabular-nums text-ink">
          {fit.fitAdjustedSummary.toFixed(1)}
        </span>{' '}
        <span className="text-ink-muted">
          ({result.weightedSummary.toFixed(1)} {fit.totalDelta < 0 ? '−' : '+'}{' '}
          {Math.abs(fit.totalDelta).toFixed(1)})
        </span>
      </p>
    </div>
  );
}
