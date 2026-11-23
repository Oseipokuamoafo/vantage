import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Notice,
  PageHeader,
  buttonClass,
} from '../../components/ui';
import { useOpportunities } from '../../data/content';
import { getPlan } from '../../data/plans';
import { MAX_COMPARE, MIN_COMPARE, toggleCompare, updateWorkspace } from '../../data/workspace';
import { useStudent } from '../../hooks/useStudent';
import { formatCost, TYPE_LABELS } from '../catalog';
import { OutcomesPanel } from '../outcomes';
import { ChangesSinceSaved, SavePlanForm } from '../saved';
import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER, scoreAll } from '../scoring';
import {
  DataQualityLegend,
  FitPanel,
  ScoreWithExplanation,
  SummaryWithExplanation,
} from '../transparency';

export default function ComparePage() {
  const { user, goal, constraints, workspace } = useStudent();
  const opportunities = useOpportunities();
  const [pick, setPick] = useState('');

  // Columns stay in the order the student added them. Never sorted by score.
  const selected = useMemo(
    () =>
      workspace.compareIds
        .map((id) => opportunities.find((o) => o.id === id))
        .filter((o) => o !== undefined),
    [workspace.compareIds, opportunities],
  );
  const results = useMemo(
    () => (goal ? scoreAll(selected, goal, constraints) : {}),
    [selected, goal, constraints],
  );

  if (!user) return null;
  if (!goal) {
    return (
      <EmptyState
        title="Choose a goal first"
        action={
          <Link to="/goal" className={buttonClass('primary')}>
            Choose a goal
          </Link>
        }
      >
        Ratings depend on the goal, so a comparison needs one.
      </EmptyState>
    );
  }

  const available = opportunities.filter(
    (o) => !workspace.compareIds.includes(o.id) && o.goalRelevance[goal.id],
  );
  const full = selected.length >= MAX_COMPARE;
  const activePlan = workspace.activePlanId ? getPlan(user.id, workspace.activePlanId) : undefined;

  function addPicked() {
    if (!pick || !user) return;
    toggleCompare(user.id, pick);
    setPick('');
  }

  const cell = 'border-b border-line p-3 align-top';
  const rowHeader = `${cell} sticky left-0 z-10 w-28 min-w-[7rem] bg-paper-sunk text-left text-sm font-semibold sm:w-40`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compare"
        title="Side-by-side comparison"
        description={
          <>
            Same measures, same order, for 2–4 options under the <strong>{goal.name}</strong> goal.
            Columns appear in the order you added them. Nothing is ranked or highlighted.
          </>
        }
      />

      {activePlan && <ChangesSinceSaved plan={activePlan} />}

      <Card className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label htmlFor="compare-pick" className="block text-sm font-medium">
              Add an opportunity ({selected.length} of {MAX_COMPARE})
            </label>
            <select
              id="compare-pick"
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              disabled={full}
              className="block min-h-[44px] w-full rounded-lg border border-line-strong bg-paper-raised px-3 py-2"
            >
              <option value="">{full ? 'Comparison is full' : 'Choose from the catalog…'}</option>
              {available.map((o) => (
                <option key={o.id} value={o.id}>
                  {TYPE_LABELS[o.type]}: {o.title}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" onClick={addPicked} disabled={!pick || full}>
            Add to comparison
          </Button>
          {selected.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => updateWorkspace(user.id, (ws) => ({ ...ws, compareIds: [] }))}
            >
              Clear all
            </Button>
          )}
        </div>
        {!constraints && (
          <Notice tone="caution">
            <Link to="/constraints" className="font-medium underline">
              Add your constraints
            </Link>{' '}
            to see hours, budget and timeline fit.
          </Notice>
        )}
      </Card>

      {selected.length < MIN_COMPARE ? (
        <EmptyState
          title={selected.length === 0 ? 'Nothing to compare yet' : 'Add one more to compare'}
          action={
            <Link to="/explore" className={buttonClass('secondary')}>
              Browse the catalog
            </Link>
          }
        >
          Pick at least {MIN_COMPARE} opportunities above or from the Explore page.
          {selected.length === 1 && ` Currently selected: ${selected[0]!.title}.`}
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-ink-muted sm:hidden">Swipe sideways to see every column.</p>
          <div
            role="region"
            aria-label="Comparison table, scrolls horizontally"
            tabIndex={0}
            className="snap-x snap-mandatory scroll-pl-28 overflow-x-auto rounded-xl sm:scroll-pl-40 border border-line bg-paper-raised"
          >
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Comparison of {selected.length} opportunities for {goal.name}, in the order added
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={`${rowHeader} align-bottom`}>
                    Attribute
                  </th>
                  {selected.map((o) => (
                    <th
                      key={o.id}
                      scope="col"
                      className={`${cell} min-w-[72vw] snap-start bg-paper-raised font-normal sm:min-w-[16rem]`}
                    >
                      <div className="space-y-2">
                        <Badge tone="ink">{TYPE_LABELS[o.type]}</Badge>
                        <p className="font-display text-lg font-semibold leading-snug">{o.title}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCompare(user.id, o.id)}
                        >
                          Remove<span className="sr-only"> {o.title}</span>
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ATTRIBUTE_ORDER.map((k) => (
                  <tr key={k}>
                    <th scope="row" className={rowHeader}>
                      {ATTRIBUTE_LABELS[k]}
                    </th>
                    {selected.map((o) => (
                      <td key={o.id} className={cell}>
                        <ScoreWithExplanation
                          attribute={results[o.id]!.attributes[k]}
                          quality={o.dataQuality}
                          showLabel={false}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className={rowHeader}>
                    Weighted summary
                  </th>
                  {selected.map((o) => (
                    <td key={o.id} className={cell}>
                      <SummaryWithExplanation result={results[o.id]!} goalName={goal.name} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Constraint fit
                  </th>
                  {selected.map((o) => (
                    <td key={o.id} className={cell}>
                      <FitPanel result={results[o.id]!} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Reported outcomes
                  </th>
                  {selected.map((o) => (
                    <td key={o.id} className={cell}>
                      <OutcomesPanel opportunityId={o.id} goalTypeId={goal.id} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Time and cost
                  </th>
                  {selected.map((o) => (
                    <td key={o.id} className={`${cell} text-sm text-ink-soft`}>
                      {o.timeCommitmentHoursPerWeek} hrs/week for {o.durationWeeks} weeks ·{' '}
                      {formatCost(o.costUSD)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Timing windows
                  </th>
                  {selected.map((o) => (
                    <td key={o.id} className={`${cell} text-sm text-ink-soft`}>
                      {o.timingWindows.length
                        ? o.timingWindows.map((w) => (
                            <p key={`${w.label}-${w.season}`}>
                              <span className="font-medium text-ink">{w.label}</span> ({w.season}):{' '}
                              {w.note}
                            </p>
                          ))
                        : 'No fixed window'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={`${rowHeader} border-b-0`}>
                    Source
                  </th>
                  {selected.map((o) => (
                    <td key={o.id} className={`${cell} border-b-0 text-sm text-ink-muted`}>
                      {o.source}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <DataQualityLegend />
          <Card className="space-y-2">
            <h2 className="font-display text-xl font-semibold">Save this comparison</h2>
            <p className="text-sm text-ink-soft">
              Saves your goal, constraints, these {selected.length} opportunities and your semester
              plan, so you can reopen them later.
            </p>
            <SavePlanForm />
          </Card>
        </>
      )}
    </div>
  );
}
