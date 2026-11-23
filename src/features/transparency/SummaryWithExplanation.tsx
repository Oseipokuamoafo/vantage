import { Badge, ScoreMeter } from '../../components/ui';
import type { BadgeTone } from '../../components/ui';
import { ATTRIBUTE_LABELS, type FitStatus, type ScoreResult } from '../scoring';
import { DataQualityBadge } from './DataQualityBadge';

const FIT_LABEL: Record<FitStatus, { text: string; tone: BadgeTone }> = {
  fits: { text: 'Fits', tone: 'accent' },
  tight: { text: 'Tight', tone: 'caution' },
  exceeds: { text: 'Exceeds', tone: 'alert' },
};

export function FitStatusBadge({ status }: { status: FitStatus }) {
  return <Badge tone={FIT_LABEL[status].tone}>{FIT_LABEL[status].text}</Badge>;
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
      <p className="text-sm font-semibold text-ink">Weighted summary</p>
      <ScoreMeter value={result.weightedSummary} label={`Weighted summary for ${goalName}`} />
      <p className="text-sm text-ink-soft">
        <span className="font-medium text-ink">Driven by:</span>{' '}
        {ATTRIBUTE_LABELS[result.primaryDriver]}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <DataQualityBadge quality={result.dataQuality} />
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-accent-strong underline-offset-2 hover:underline">
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
      <p className="text-sm font-semibold text-ink">Constraint fit (separate from the rating)</p>
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
