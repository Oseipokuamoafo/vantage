import { Button } from '../../components/ui';
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
import { TYPE_COLORS } from './typeShapes';

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
      className={`spotlight group relative scroll-mt-24 space-y-4 overflow-hidden rounded-2xl border bg-paper-raised p-4 pl-6 transition duration-200 hover:shadow-lift sm:p-6 sm:pl-8 ${
        inCompare ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-line-strong'
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5 transition-[width] duration-200 group-hover:w-2.5"
        style={{ background: TYPE_COLORS[opp.type] }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <TypeMark type={opp.type} />
              {TYPE_LABELS[opp.type]}
            </span>
            <DataQualityBadge quality={opp.dataQuality} />
          </p>
          <h2 id={headingId} className="text-xl font-extrabold leading-snug sm:text-2xl">
            {opp.title}
          </h2>
          <ul className="flex flex-wrap gap-1.5 text-sm" aria-label="Time and cost">
            <li className="tabular rounded-md bg-paper-sunk px-2 py-0.5 font-semibold">
              {opp.timeCommitmentHoursPerWeek} h/week
            </li>
            <li className="tabular rounded-md bg-paper-sunk px-2 py-0.5 font-semibold">
              {opp.durationWeeks} {opp.durationWeeks === 1 ? 'week' : 'weeks'}
            </li>
            <li className="tabular rounded-md bg-paper-sunk px-2 py-0.5 font-semibold">
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
      <p className="max-w-[70ch] leading-relaxed text-ink-soft">{opp.description}</p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Skills built">
        {opp.skillsBuilt.map((s) => (
          <li
            key={s}
            className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-ink-soft"
          >
            {s}
          </li>
        ))}
      </ul>

      {result && goal ? (
        <section
          aria-label={`Ratings for ${goal.name}`}
          className="space-y-4 border-t border-line pt-5"
        >
          <div className="grid gap-5 md:grid-cols-3">
            {ATTRIBUTE_ORDER.map((k) => (
              <ScoreWithExplanation
                key={k}
                attribute={result.attributes[k]}
                quality={result.dataQuality}
              />
            ))}
          </div>
          <div className="grid gap-5 rounded-xl bg-paper p-4 md:grid-cols-2">
            <SummaryWithExplanation result={result} goalName={goal.name} />
            <FitPanel result={result} />
          </div>
        </section>
      ) : null}

      <details className="disclosure rounded-xl border border-line px-4 py-3 transition-colors hover:border-line-strong">
        <summary className="text-sm font-semibold">
          Signaling notes, timing, outcomes and source
        </summary>
        <div className="mt-3 space-y-3 text-sm">
          <p>
            <span className="font-semibold">Signaling notes:</span>{' '}
            <span className="text-ink-soft">{opp.signalingNotes}</span>
          </p>
          {opp.timingWindows.length > 0 && (
            <div>
              <p className="font-semibold">Timing windows</p>
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
              <p className="font-semibold">Reported outcomes</p>
              <OutcomesPanel opportunityId={opp.id} goalTypeId={goal.id} />
            </div>
          )}
          <p className="text-ink-muted">Source: {opp.source}</p>
        </div>
      </details>
    </article>
  );
}
