import { Badge, Button, Card } from '../../components/ui';
import type { GoalType, Opportunity } from '../../data/types';
import { OutcomesPanel } from '../outcomes';
import { ATTRIBUTE_ORDER, type ScoreResult } from '../scoring';
import {
  DataQualityBadge,
  FitPanel,
  ScoreWithExplanation,
  SummaryWithExplanation,
} from '../transparency';
import { formatCost, TYPE_LABELS } from './labels';

interface Props {
  opp: Opportunity;
  goal?: GoalType;
  result?: ScoreResult;
  inCompare: boolean;
  compareFull: boolean;
  onToggleCompare: () => void;
}

export function OpportunityCard({
  opp,
  goal,
  result,
  inCompare,
  compareFull,
  onToggleCompare,
}: Props) {
  const headingId = `opp-${opp.id}`;
  return (
    <Card as="article" aria-labelledby={headingId} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="ink">{TYPE_LABELS[opp.type]}</Badge>
            <DataQualityBadge quality={opp.dataQuality} />
          </div>
          <h2 id={headingId} className="font-display text-xl font-semibold leading-snug">
            {opp.title}
          </h2>
          <p className="text-sm text-ink-muted">
            {opp.timeCommitmentHoursPerWeek} hrs/week · {opp.durationWeeks}{' '}
            {opp.durationWeeks === 1 ? 'week' : 'weeks'} · {formatCost(opp.costUSD)}
          </p>
        </div>
        <Button
          variant={inCompare ? 'primary' : 'secondary'}
          size="sm"
          aria-pressed={inCompare}
          disabled={!inCompare && compareFull}
          onClick={onToggleCompare}
          className="shrink-0"
        >
          {inCompare
            ? '✓ In comparison'
            : compareFull
              ? 'Comparison full (4)'
              : 'Add to comparison'}
          <span className="sr-only"> for {opp.title}</span>
        </Button>
      </div>
      <p className="text-ink-soft">{opp.description}</p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Skills built">
        {opp.skillsBuilt.map((s) => (
          <li key={s}>
            <Badge>{s}</Badge>
          </li>
        ))}
      </ul>

      {result && goal ? (
        <section
          aria-label={`Ratings for ${goal.name}`}
          className="space-y-4 border-t border-line pt-4"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {ATTRIBUTE_ORDER.map((k) => (
              <ScoreWithExplanation
                key={k}
                attribute={result.attributes[k]}
                quality={result.dataQuality}
              />
            ))}
          </div>
          <div className="grid gap-4 rounded-lg bg-paper p-3 md:grid-cols-2">
            <SummaryWithExplanation result={result} goalName={goal.name} />
            <FitPanel result={result} />
          </div>
        </section>
      ) : null}

      <details className="rounded-lg border border-line p-3">
        <summary className="cursor-pointer text-sm font-medium">
          More detail: signaling, timing, outcomes, source
        </summary>
        <div className="mt-3 space-y-3 text-sm">
          <p>
            <span className="font-medium">Signaling notes:</span>{' '}
            <span className="text-ink-soft">{opp.signalingNotes}</span>
          </p>
          {opp.timingWindows.length > 0 && (
            <div>
              <p className="font-medium">Timing windows</p>
              <ul className="list-disc pl-5 text-ink-soft">
                {opp.timingWindows.map((w) => (
                  <li key={`${w.label}-${w.season}`}>
                    {w.label} ({w.season}): {w.note}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {goal && (
            <div>
              <p className="font-medium">Reported outcomes</p>
              <OutcomesPanel opportunityId={opp.id} goalTypeId={goal.id} />
            </div>
          )}
          <p className="text-ink-muted">Source: {opp.source}</p>
        </div>
      </details>
    </Card>
  );
}
