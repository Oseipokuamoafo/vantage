import { Button, Tag } from '../../components/ui';
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
import { TypeMark } from './TypeMark';

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
    <article
      id={`card-${opp.id}`}
      aria-labelledby={headingId}
      className={`scroll-mt-28 space-y-5 rounded-card border bg-surface p-5 shadow-soft transition-shadow duration-brand ease-brand hover:shadow-hover sm:p-7 ${
        inCompare ? 'border-primary ring-1 ring-primary' : 'border-border'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-primary bg-surface px-3 py-0.5 text-xs font-semibold text-navy">
              <TypeMark type={opp.type} size={12} />
              {TYPE_LABELS[opp.type]}
            </span>
            <DataQualityBadge quality={opp.dataQuality} />
          </div>
          <h2 id={headingId} className="text-xl font-extrabold leading-snug sm:text-2xl">
            {opp.title}
          </h2>
          <ul className="flex flex-wrap gap-2 text-sm" aria-label="Time and cost">
            <li className="tabular rounded-full bg-page px-3 py-1 font-semibold text-navy">
              {opp.timeCommitmentHoursPerWeek} h/week
            </li>
            <li className="tabular rounded-full bg-page px-3 py-1 font-semibold text-navy">
              {opp.durationWeeks} {opp.durationWeeks === 1 ? 'week' : 'weeks'}
            </li>
            <li className="tabular rounded-full bg-page px-3 py-1 font-semibold text-navy">
              {formatCost(opp.costUSD)}
            </li>
          </ul>
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
      <p className="max-w-[70ch] text-body">{opp.description}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Skills built">
        {opp.skillsBuilt.map((s) => (
          <li key={s}>
            <Tag>{s}</Tag>
          </li>
        ))}
      </ul>

      {result && goal ? (
        <section
          aria-label={`Ratings for ${goal.name}`}
          className="space-y-5 border-t border-border pt-6"
        >
          <div className="grid gap-6 md:grid-cols-3">
            {ATTRIBUTE_ORDER.map((k) => (
              <ScoreWithExplanation
                key={k}
                attribute={result.attributes[k]}
                quality={result.dataQuality}
              />
            ))}
          </div>
          <div className="grid gap-6 rounded-card border border-border bg-page p-5 md:grid-cols-2">
            <SummaryWithExplanation result={result} goalName={goal.name} />
            <FitPanel result={result} />
          </div>
        </section>
      ) : null}

      <details className="disclosure rounded-2xl border border-border px-4 py-3 transition-colors duration-brand hover:border-primary/40">
        <summary className="text-sm font-semibold text-navy">
          Signaling notes, timing, outcomes and source
        </summary>
        <div className="mt-3 space-y-3 text-sm">
          <p>
            <span className="font-semibold text-navy">Signaling notes:</span>{' '}
            <span className="text-body">{opp.signalingNotes}</span>
          </p>
          {opp.timingWindows.length > 0 && (
            <div>
              <p className="font-semibold text-navy">Timing windows</p>
              <ul className="list-disc pl-5 text-body">
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
              <p className="font-semibold text-navy">Reported outcomes</p>
              <OutcomesPanel opportunityId={opp.id} goalTypeId={goal.id} />
            </div>
          )}
          <p className="text-muted">Source: {opp.source}</p>
        </div>
      </details>
    </article>
  );
}
